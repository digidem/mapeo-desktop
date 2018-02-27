var fs = require('fs')
var importGeo = require('./import-geo')
var concat = require('concat-stream')
var shp = require('gtran-shapefile')
var path = require('path')

module.exports = function (osm, name, done) {
  var ext = path.extname(name)
  if (ext === '.geojson') {
    console.log('geojson import', name)
    concat(fs.createReadStream(name), function (geojson) {
      if (err) return done(err)
      return importGeo(osm, geojson, done)
    })
  }
  else if (ext === '.shp') {
    shp.toGeoJson(name).then(function (geojson) {
      return importGeo(osm, geojson, done)
    })
  }
}
