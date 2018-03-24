var fs = require('fs')
var osmGeoJson = require('osm-p2p-geojson')
var concat = require('concat-stream')
var shp = require('gtran-shapefile')
var path = require('path')

module.exports = function (osm, name, done) {
  var ext = path.extname(name)
  if (ext === '.geojson') {
    var readStream = fs.createReadStream(name)
    readStream.on('error', done)
    readStream.pipe(concat(function (geojson) {
      var data = JSON.parse(geojson)
      return importGeo(osm, data, done)
    }))
  }
  else if (ext === '.shp') {
    shp.toGeoJson(name).then(function (geojson) {
      return osmGeoJson.import(osm, geojson, done)
    })
  }
}
