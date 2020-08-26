// (mostly) from https://github.com/julianrubisch/express-asset-file-cache-middleware/edit/master/index.js
const crypto = require('crypto')
const sprintf = require('sprintf-js').sprintf
const fs = require('fs')
const path = require('path')
const pump = require('pump')
const through = require('through2')
const rimraf = require('rimraf')

const getFolderSize = require('get-folder-size')

function makeDirIfNotExists (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

/* from https://github.com/segment-boneyard/hash-mod/blob/master/lib/index.js */
function integerHash (string) {
  return (string + '').split('').reduce((memo, item) => {
    return (memo * 31 * item.charCodeAt(0)) % 982451653
  }, 7)
}

function makeAssetCachePath (cacheDir, cacheKey) {
  const hash = crypto
    .createHash('sha256')
    .update(cacheKey)
    .digest('hex')

  const quotient = Math.floor(integerHash(hash) / 0x1000)
  const bucket1 = integerHash(hash) % 0x1000
  const bucket2 = quotient % 0x1000

  const bucket1HexString = sprintf('%x', bucket1)
  const bucket2HexString = sprintf('%x', bucket2)

  return {
    dir1: bucket1HexString,
    dir2: bucket2HexString,
    dir3: hash.toString(),
    path: path.join(
      cacheDir,
      bucket1HexString,
      bucket2HexString,
      hash.toString()
    )
  }
}

function encodeAssetCacheName (contentType, contentLength) {
  return Buffer.from(`${contentType}:${contentLength}`).toString('base64')
}

function decodeAssetCacheName (encodedString) {
  const decodedFileName = Buffer.from(encodedString, 'base64').toString(
    'ascii'
  )
  return decodedFileName.split(':')
}

function touch (path) {
  const time = new Date()
  try {
    fs.utimesSync(path, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(path, 'w'))
  }
}

function evictLeastRecentlyUsed (cacheDir, maxSize, logger) {
  getFolderSize(cacheDir, (err, size) => {
    if (err) {
      throw err
    }

    if (size >= maxSize) {
      try {
        // find least recently used file
        const leastRecentlyUsed = findLeastRecentlyUsed(cacheDir)

        // and delete it
        const { dir } = path.parse(leastRecentlyUsed.path)
        fs.unlinkSync(leastRecentlyUsed.path)
        fs.rmdirSync(dir)

        if (logger) {
          logger.info(`Evicted ${leastRecentlyUsed.path} from cache`)
        }

        evictLeastRecentlyUsed(cacheDir, maxSize, logger)
      } catch (e) {
        logger.error(e)
      }
    }
  })
}

function findLeastRecentlyUsed (dir, result) {
  const files = fs.readdirSync(dir)
  result = result || { atime: Date.now(), path: '' }

  files.forEach(file => {
    const newBase = path.join(dir, file)

    if (fs.statSync(newBase).isDirectory()) {
      result = findLeastRecentlyUsed(newBase, result)
    } else {
      const { atime } = fs.statSync(newBase)

      if (atime < result.atime) {
        result = {
          atime,
          path: newBase
        }
      }
    }
  })

  return result
}

const middleWare = (module.exports = function (getAsset, options) {
  return async function (req, res, params, next) {
    options = options || {}
    options.cacheDir =
      options && options.cacheDir
        ? options.cacheDir
        : path.join(process.cwd(), 'tmp')
    options.maxSize =
      options && options.maxSize ? options.maxSize : 1024 * 1024 * 1024

    const {
      dir1,
      dir2,
      dir3,
      path: assetCachePath
    } = middleWare.makeAssetCachePath(
      options.cacheDir,
      req.url
    )

    const startTime = process.hrtime()

    try {
      if (fs.existsSync(assetCachePath)) {
        const firstFile = fs.readdirSync(assetCachePath)[0]

        // touch file for LRU eviction
        var filepath = `${assetCachePath}/${firstFile}`
        middleWare.touch(filepath)

        var stats = fs.statSync(filepath)

        const [contentType, contentLength] = middleWare.decodeAssetCacheName(
          firstFile
        )

        // TODO: contentLength is incorrect here

        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Length', stats.size)

        const [seconds, nanoSeconds] = process.hrtime(startTime)
        if (options.logger) {
          options.logger.info(
            `Read buffer from path ${filepath} in ${seconds *
              1000 +
              nanoSeconds / 1e6} ms`
          )
        }
        var rs = fs.createReadStream(filepath)
        pump(rs, res, next)
      } else {
        // node 10 supports recursive: true, but who knows?
        middleWare.makeDirIfNotExists(options.cacheDir)
        middleWare.makeDirIfNotExists(path.join(options.cacheDir, dir1))
        middleWare.makeDirIfNotExists(path.join(options.cacheDir, dir1, dir2))
        middleWare.makeDirIfNotExists(
          path.join(options.cacheDir, dir1, dir2, dir3)
        )
        var { stream, contentType, contentLength } = getAsset(req, res, params)

        const fileName = middleWare.encodeAssetCacheName(contentType, contentLength)

        middleWare.evictLeastRecentlyUsed(
          options.cacheDir,
          options.maxSize,
          options.logger
        )
        const filepath = `${assetCachePath}/${fileName}`
        var ws = fs.createWriteStream(filepath)
        const write = through((data, enc, next) => {
          var cb = () => {
            next(null, data)
          }
          if (!ws.write(data)) {
            ws.once('drain', cb)
          } else {
            process.nextTick(cb)
          }
        })
        res.setHeader('Content-Type', contentType)

        pump(stream, write, res, (err) => {
          if (err) return next(err)
          const [seconds, nanoSeconds] = process.hrtime(startTime)
          ws.end()
          if (options.logger) {
            options.logger.info(
              `Wrote buffer to path ${assetCachePath}/${fileName} in ${seconds *
                1000 +
                nanoSeconds / 1e6} ms`
            )
          }
        })
      }
    } catch (e) {
      // in case we write partial data and fails
      if (fs.existsSync(assetCachePath)) {
        rimraf.sync(assetCachePath)
      }

      if (options.logger) {
        options.logger.error(
          `Caching asset at ${assetCachePath} failed with error: ${e.message}`
        )
      }

      next(e)
    }
  }
})

middleWare.makeAssetCachePath = makeAssetCachePath
middleWare.makeDirIfNotExists = makeDirIfNotExists
middleWare.encodeAssetCacheName = encodeAssetCacheName
middleWare.decodeAssetCacheName = decodeAssetCacheName
middleWare.findLeastRecentlyUsed = findLeastRecentlyUsed
middleWare.evictLeastRecentlyUsed = evictLeastRecentlyUsed
middleWare.touch = touch
