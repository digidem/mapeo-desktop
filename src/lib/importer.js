var fs = require('fs')
var osmGeoJson = require('osm-p2p-geojson')
var concat = require('concat-stream')
var shp = require('gtran-shapefile')
var path = require('path')
var inherits = require('inherits')
var events = require('events')

module.exports = Importer

function Importer (osm) {
  if (!(this instanceof Importer)) return new Importer(osm)
  events.EventEmitter.call(this)
  this.importer = osmGeoJson.importer(osm)
}

inherits(Importer, events.EventEmitter)

Importer.prototype.importFromFile = function (name, done) {
  var self = this
  var ext = path.extname(name)
  var importer = this.importer
  importer.on('error', function (err) {
    self.emit('import-error', err, name)
  })
  importer.on('done', function () {
    self.emit('import-complete', name)
  })
  importer.on('import', function (index, total) {
    self.emit('import-progress', name, index, total)
  })
  if (ext === '.geojson') {
    var readStream = fs.createReadStream(name)
    readStream.on('error', done)
    readStream.pipe(concat(function (data) {
      var geojson = JSON.parse(data)
      return importer.importFeatureCollection(geojson, done)
    }))
  }
  else if (ext === '.shp') {
    shp.toGeoJson(name).then(function (geojson) {
      return importer.importFeatureCollection(geojson, done)
    })
  }
}
