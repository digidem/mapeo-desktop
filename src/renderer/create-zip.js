import yazl from 'yazl'
import run from 'run-parallel-limit'
import ky from 'ky/umd'
import once from 'once'
import { defineMessages } from 'react-intl'
import logger from '../logger'

// Photos are downloaded from mapeo core 3 at a time
const concurrency = 3
// Need to use carraige return in text files so new lines show in Windows.
const CR = '\r\n'
const msgs = defineMessages({
  // File name for file with information about export errors
  errorsFilename: {
    id: 'renderer.create-zip.errorsFilename',
    defaultMessage: 'Export Errors'
  },
  // File name for file with information about missing originals in export
  missingOriginalsFilename: {
    id: 'renderer.create-zip.missingOriginalsFilename',
    defaultMessage: 'Missing Originals'
  },
  // Error message stored in text file in export if there were errors during export
  errorsMsg: {
    id: 'renderer.create-zip.errorsMsg',
    defaultMessage:
      'There was an error trying to export these files, so they are missing from this export:'
  },
  // Message stored in text file in export if originals are missing. The message is followed by a list of filenames with missing originals
  missingOriginalsMsg: {
    id: 'renderer.create-zip.missingOriginalsMsg',
    defaultMessage:
      'The original size of these files could not be found, only preview size (1,200 pixel) images are included. This can happen because the phone that took the photos has only synced to other phones, and not directly to Mapeo Desktop. To try fixing this, find the phone that took the photos and sync it with Mapeo Desktop before exporting again.'
  }
})

/**
 * Create a zipfile from a collection of strings/buffers and remote files
 * (remote files will be downloaded concurrently and streamed to the zipfile)
 *
 * @param {Array} localFiles Array of files to add to the zip archive. Must have
 * properties `data` which should be a Buffer or String, and `metadataPath`
 * which is the path to the file in the zipfile. Can also include options from
 * https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
 * @param {Array} remoteFiles Array of files to add to the zip archive. Must
 * have properties `url` and `metadataPath` which is the path to the file in the
 * zipfile. Can also include `fallbackUrl` which will be tried if `url` fails
 * with an error, and any options from
 * https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
 * @param {Object} options
 * @param {Function} options.formatMessage From react-intl formatMessage
 * @returns {ReadableStream} readableStream of zipfile data
 */
export default function createZip (
  localFiles,
  remoteFiles = [],
  { formatMessage }
) {
  const zipfile = new yazl.ZipFile()
  const errors = []
  const missingOriginals = []

  localFiles.forEach(({ data, metadataPath, ...options }) => {
    if (typeof data === 'string') data = Buffer.from(data)
    zipfile.addBuffer(data, metadataPath, options)
  })

  const tasks = remoteFiles.map(f => downloadTask(f))

  function downloadTask (
    { url, metadataPath, fallbackUrl, ...options },
    isFallback
  ) {
    return function (cb) {
      cb = once(cb)
      const start = Date.now()
      logger.debug('Requesting', url)
      // I tried doing this by adding streams to the zipfile, but it's really hard
      // to catch errors when trying to download an image, so you end up with
      // corrupt files in the zip. This uses a bit more memory, but images are
      // only added once they have downloaded correctly
      ky.get(url)
        .arrayBuffer()
        .then(arrBuf => {
          if (isFallback) missingOriginals.push(metadataPath)
          logger.debug(
            'Req end in ' + (Date.now() - start) + 'ms ' + metadataPath
          )
          zipfile.addBuffer(Buffer.from(arrBuf), metadataPath, {
            ...options,
            store: true
          })
          cb()
        })
        .catch(err => {
          logger.error(
            `Error downloading file ${metadataPath} from ${url}`,
            err
          )
          if (isFallback || !fallbackUrl) {
            errors.push(metadataPath)
            cb()
          } else {
            logger.info(`Trying fallback URL ${fallbackUrl}`)
            downloadTask(
              { url: fallbackUrl, metadataPath, ...options },
              true
            )(cb)
          }
        })
    }
  }

  const start = Date.now()
  logger.debug('Starting download')
  run(tasks, concurrency, (...args) => {
    logger.info('Downloaded images in ' + (Date.now() - start) + 'ms')
    if (errors.length) {
      zipfile.addBuffer(
        Buffer.from(
          formatMessage(msgs.errorsMsg) + CR + CR + errors.join(CR) + CR
        ),
        formatMessage(msgs.errorsFilename) + '.txt'
      )
    }
    if (missingOriginals.length) {
      zipfile.addBuffer(
        Buffer.from(
          formatMessage(msgs.missingOriginalsMsg) +
            CR +
            CR +
            missingOriginals.join(CR) +
            CR
        ),
        formatMessage(msgs.missingOriginalsFilename) + '.txt'
      )
    }
    zipfile.end()
  })

  return zipfile.outputStream
}
