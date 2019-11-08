import yazl from 'yazl'
import run from 'run-parallel-limit'
import ky from 'ky/umd'
import once from 'once'

const concurrency = 3

/**
 * Create a zipfile from a collection of strings/buffers and remote files
 * (remote files will be downloaded concurrently and streamed to the zipfile)
 *
 * @param {Array} localFiles Array of files to add to the zip archive. Must have
 * properties `data` which should be a Buffer or String, and `name`
 * which is the path to the file in the zipfile. Can also include options from
 * https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
 * @param {Array} remoteFiles Array of files to add to the zip archive. Must
 * have properties `url` and `name` which is the path to the file in the
 * zipfile. Can also include options from
 * https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
 * @returns {ReadableStream} readableStream of zipfile data
 */
export default function createZip (localFiles, remoteFiles) {
  const zipfile = new yazl.ZipFile()
  const missing = []

  localFiles.forEach(({ data, metadataPath, ...options }) => {
    if (typeof data === 'string') data = Buffer.from(data)
    zipfile.addBuffer(data, metadataPath, options)
  })

  const tasks = remoteFiles.map(({ url, metadataPath, ...options }) => cb => {
    cb = once(cb)
    const start = Date.now()
    console.log('Requesting', url)
    // I tried doing this by adding streams to the zipfile, but it's really hard
    // to catch errors when trying to download an image, so you end up with
    // corrupt files in the zip. This uses a bit more memory, but images are
    // only added once they have downloaded correctly
    ky.get(url)
      .arrayBuffer()
      .then(arrBuf => {
        console.log('Req end in ' + (Date.now() - start) + 'ms ' + metadataPath)
        zipfile.addBuffer(Buffer.from(arrBuf), metadataPath, {
          ...options,
          store: true
        })
        cb()
      })
      .catch(err => {
        missing.push(metadataPath)
        console.log('Error downloading file ' + metadataPath, err)
        cb()
      })
  })
  const start = Date.now()
  console.log('Starting download')
  run(tasks, concurrency, (...args) => {
    console.log('Downloaded images in ' + (Date.now() - start) + 'ms')
    if (missing.length) {
      zipfile.addBuffer(Buffer.from(missing.join('\n') + '\n'), 'missing.txt')
    }
    zipfile.end()
  })

  return zipfile.outputStream
}
