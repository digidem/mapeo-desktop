const mkdirp = require('mkdirp')
const pump = require('pump')
const path = require('path')
const tar = require('tar-fs')
const mirror = require('mirror-folder')
const fs = require('fs')

module.exports = TileImporter

function TileImporter (userData, defaults) {
  if (!(this instanceof TileImporter)) return new TileImporter(userData, defaults)
  this.editing = false
  this.defaults = Object.assign({}, TileImporter.defaults, defaults)
  this.userData = userData
}

TileImporter.defaults = {
  name: 'Offline Maps',
  type: 'tms', // TODO: what is this??
  overlay: false,
  default: false,
  overzoom: true,
  scaleExtent: [0, 22],
  url: 'http://localhost:5005',
  templatePattern: '/{zoom}/{x}/{y}.png'
}

TileImporter.prototype.go = function (tilesPath, options, cb) {
  if (!cb) {
    cb = options
    options = TileImporter.defaults
  }
  var self = this
  if (self.editing) return cb(new Error('Tiles importing, please wait...'))
  self.editing = true
  var imageryPath = path.join(this.userData, 'imagery.json')
  options.id = options.name.replace(' ', '-') // what else should we normalize?
  var tilesDest = path.join(this.userData, 'tiles', options.id)
  this.moveTiles(tilesPath, tilesDest, function (err) {
    if (err) return done(err)
    fs.readFile(imageryPath, function (err, data) {
      if (err && err.code !== 'ENOENT') return done(err)
      var imagery = data ? JSON.parse(data) : []
      var matches = imagery.filter((obj) => obj.name === options.name)
      if (matches.length) return done()
      imagery.push(self._entry(options))
      fs.writeFile(imageryPath, JSON.stringify(imagery, null, 2), done)
    })
  })

  function done (err) {
    console.error(err)
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

TileImporter.prototype.moveTiles = function (tilesPath, dir, cb) {
  var self = this
  if (path.extname(tilesPath) === '.tar') return this._extractTar(tilesPath, dir, cb)
  if (path.extname(tilesPath) === '.mbtiles') {
    var destFile = path.join(dir, path.basename(tilesPath))
    return fs.copyFile(tilesPath, destFile, cb)
  }
  fs.stat(tilesPath, function (err, stat) {
    if (err) return cb(err)
    if (stat.isDirectory()) {
      return self._moveDirectory(tilesPath, dir, cb)
    } else return cb(new Error('Tiles be a .tar, .mbtiles, or directory.'))
  })
}

TileImporter.prototype._moveDirectory = function (tilesPath, dir, cb) {
  fs.stat(dir, function (err, stats) {
    if (err) mkdirp(dir, done)
    else done()
  })

  function done (err) {
    if (err) return cb(err)
    mirror(tilesPath, dir, cb)
  }
}

TileImporter.prototype._entry = function (options) {
  var entry = Object.assign({}, this.defaults, options)
  entry.template = entry.template || path.join(entry.url, entry.id, entry.templatePattern)
  return entry
}
