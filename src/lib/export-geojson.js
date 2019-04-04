var exportGeoJson = require('osm-p2p-geojson')
var pump = require('pump')
var osmApi = require('osm-p2p-api')

module.exports = function (osm, presets, bbox) {
  var api = osmApi(osm)
  if (!bbox) bbox = [ -Infinity, -Infinity, Infinity, Infinity ]

  var matchPreset = require('./preset-matcher')(presets.presets)
  var isPolygonFeature = require('./polygon-feature')(presets.presets)

  var featureMap = function (f) {
    var newProps = {}
    Object.keys(f.properties).forEach(function (key) {
      var newKey = key.replace(':', '_')
      newProps[newKey] = f.properties[key]
    })
    f.properties = newProps
    var match = matchPreset(f)
    if (match) {
      f.properties.icon = match.icon
      f.properties.preset = match.id
    }
    return f
  }

  var source = api.getMap(bbox, { forks: false })
  var dest = exportGeoJson(osm, {
    map: featureMap,
    polygonFeatures: isPolygonFeature
  })
  return pump(source, dest)
}
