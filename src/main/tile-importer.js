const logger = require('electron-timber')
const mkdirp = require('mkdirp')
const pump = require('pump')
const path = require('path')
const tar = require('tar-fs')
const asar = require('asar')
const fs = require('fs')

module.exports = TileImporter

function TileImporter (userData, defaults) {
  if (!(this instanceof TileImporter)) {
    return new TileImporter(userData, defaults)
  }
  this.editing = false
  this.defaults = Object.assign({}, TileImporter.defaults, defaults)
  this.userData = userData
}

TileImporter.defaults = {
  id: 'default',
  name: 'Custom: Imported Offline Maps',
  type: 'tms', // TODO: what is this??
  overlay: false,
  default: false,
  overzoom: true,
  scaleExtent: [0, 22],
  url: 'http://localhost:5000',
  templatePattern: '/{zoom}/{x}/{y}'
}

TileImporter.prototype.go = function (tilesPath, options, cb) {
  if (!cb) {
    cb = options
    options = TileImporter.defaults
  }
  var self = this
  if (self.editing) return cb(new Error('Tiles importing, please wait...'))
  self.editing = true
  options.id = options.id || options.name.replace(' ', '-') // what else should we normalize?
  var tilesDest = path.join(this.userData, 'styles', options.id, 'tiles')
  this.moveTiles(tilesPath, tilesDest, function (err) {
    if (err) return done(err)
    self.editing = false
    done()
  })

  function done (err) {
    logger.error('ERROR(tile-importer)', err)
    self.editing = false
    cb(err)
  }
}

function getBaseParts (parts) {
  if (!parts.length) return false
  var isNotZoom = Number.isNaN(Number(parts[0]))
  if (isNotZoom) {
    parts.shift()
    return getBaseParts(parts)
  }
  return parts
}

TileImporter.prototype._extractTar = function (tilesPath, destPath, cb) {
  var read = fs.createReadStream(tilesPath)
  var extract = tar.extract(destPath, {
    map: function (header) {
      var parsed = path.parse(header.name)
      var parts = getBaseParts(parsed.dir.split(path.sep))
      if (!parts) return header // not smart enough, lets just leave it how it is
      parsed.dir = parts.join(path.sep)
      header.name = path.format(parsed)
      return header
    }
  })
  pump(read, extract, cb)
}

TileImporter.prototype.moveTiles = function (tilesPath, tilesDest, cb) {
  fs.stat(tilesPath, (err, stat) => {
    if (err) return cb(err)
    mkdirp(tilesDest, err => {
      if (err) return cb(err)
      // TODO: deprecate asar support
      if (path.extname(tilesPath) === '.asar') {
        var filename = path.basename(tilesPath)
        // because electron treats asar as a folder, not a file.
        process.noAsar = true
        return fs.copyFile(tilesPath, path.join(tilesDest, filename), err => {
          process.noAsar = false
          return cb(err)
        })
      }
      if (stat.isDirectory()) {
        var styleId = path.basename(tilesDest)
        return this._createAsar(
          tilesPath,
          path.join(tilesDest, styleId + '.asar'),
          cb
        )
      }
      if (path.extname(tilesPath) === '.tar') {
        this._extractTar(tilesPath, tilesDest, cb)
      } else {
        return cb(new Error('Must be a .tar, .asar, or directory with tiles.'))
      }
    })
  })
}

TileImporter.prototype._createAsar = function (tilesPath, destFile, cb) {
  logger.log('creating asar', tilesPath, destFile)
  try {
    asar.createPackage(tilesPath, destFile).then(cb)
  } catch (err) {
    logger.error('ERROR(tile-importer): Got error when creating asar', err)
    return cb(err)
  }
}

TileImporter.prototype._entry = function (options) {
  var entry = Object.assign({}, this.defaults, options)
  entry.template =
    entry.template || path.join(entry.url, entry.id, entry.templatePattern)
  return entry
}
