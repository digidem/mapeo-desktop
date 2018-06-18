var path = require('path')
var pump = require('pump')
var fs = require('fs')
var replicate = require('./replicate')
var exportGeoJson = require('./export-geojson')
var exportShapefile = require('./export-shapefile')

module.exports = function (mapeo, filename, done) {
  var ext = path.extname(filename)
  switch (ext) {
    case '.geojson': return pump(exportGeoJson(mapeo.api.osm), fs.createWriteStream(filename), done)
    case '.shp': return exportShapefile(mapeo.api.osm, filename, done)
    case '.mapeodata': return exportSyncfile(mapeo.api.sync, filename, done)
    default: return done(new Error('Extension not supported'))
  }
}

function exportSyncfile (sync, filename, done) {
  var progress = sync.replicateFromFile(filename)
  progress.on('error', done)
  progress.on('end', done)
}
