var path = require('path')
var pump = require('pump')
var fs = require('fs')
var exportGeoJson = require('./export-geojson')
var exportShapefile = require('./export-shapefile')

module.exports = function (osm, filename, done) {
  var ext = path.extname(filename)
  switch (ext) {
    case '.geojson': return pump(exportGeoJson(osm), fs.createWriteStream(filename), done)
    case '.shp': return exportShapefile(osm, filename, done)
    default: return done(new Error('Extension not supported'))
  }
}
