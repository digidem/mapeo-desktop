var concat = require('concat-stream')
var shapefile = require('gtran-shapefile')
var exportGeoJson = require('./export-geojson')

module.exports = function (osm, filename, done) {
  var GeoJSONStream = exportGeoJson(osm)
  GeoJSONStream.on('error', done)
  GeoJSONStream.pipe(concat((geojson) => {
    shapefile.fromGeoJson(JSON.parse(geojson), filename).then(function (filenames) {
      console.log('data has been exported at', filenames)
      done(null, filenames)
    })
  }))
}
