var path = require('path')
var through = require('through2')
var randomBytes = require('randombytes')
var mkdirp = require('mkdirp')
var level = require('level')
var osmdb = require('osm-p2p')
var osmobs = require('osm-p2p-observations')
var pump = require('pump')
var drive = require('./drive.js')
var collect = require('collect-stream')

module.exports = Api

function Api (osmdir) {
  if (!(this instanceof Api)) return new Api(osmdir)
  var mediadir = path.join(osmdir, 'media')
  mkdirp.sync(mediadir)
  var obsdb = level(path.join(osmdir, 'obsdb'))
  var drivedb = level(path.join(osmdir, 'drivedb'))
  this.archive = drive(drivedb, { dir: mediadir })
  this.osm = osmdb(osmdir)
  this.obs = osmobs({ db: obsdb, log: this.osm.log })
}

Api.prototype.mediaList = function (cb) {
  collect(this.archive.list({ live: false }), cb)
}

Api.prototype.mediaRead = function (name, cb) {
  collect(this.archive.createFileReadStream(name), cb)
}

Api.prototype.mediaCreate = function (filename, data, opts, cb) {
  if (arguments.length === 3 && typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  var ws = this.archive.createFileWriteStream(filename)
  ws.end(data)
  ws.on('finish', function () {
    cb(null, 'mapfilter://' + filename)
  })
}

Api.prototype.observationCreate = function (feature, cb) {
  if (!(feature.type === 'Feature' && feature.geometry && feature.geometry.type === 'Point')) {
    return cb(new Error('Expected `Point` GeoJSON feature object'))
  }
  var obs = {
    type: 'observation',
    lon: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    tags: feature.properties,
    timestamp: new Date().toISOString()
  }
  var id = feature.id + '' || randomBytes(8).toString('hex')
  this.osm.put(id, obs, cb)
}

Api.prototype.observationList = function (cb) {
  var features = []
  pump(this.osm.kv.createReadStream(), through.obj(write), done)

  function write (row, enc, next) {
    var values = Object.keys(row.values || {})
      .map(v => row.values[v])
    if (values.length && values[0].type === 'observation') {
      var latest = values.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0]
      features.push(observationToFeature(latest, row.key))
    }
    next()
  }

  function done (err) {
    if (err) return cb(err)
    cb(null, features)
  }
}

function observationToFeature (obs, id) {
  var feature = {
    id: id,
    type: 'Feature',
    geometry: null,
    properties: obs.tags
  }
  if (obs.lon && obs.lat) {
    feature.geometry = {
      type: 'Point',
      coordinates: [obs.lon, obs.lat]
    }
  }
  return feature
}
