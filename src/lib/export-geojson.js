var exportGeoJson = require('osm-p2p-geojson')
var pump = require('pump')
var osmApi = require('osm-p2p-api')

var userConfig = require('./user-config')
var presets = userConfig.getSettings('presets') || {}

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

module.exports = function (osm, bbox) {
  var api = osmApi(osm)
  bbox = [ -Infinity, -Infinity, Infinity, Infinity ]

  var source = api.getMap(bbox, {forks: false})
  var dest = exportGeoJson(osm, {
    map: featureMap,
    polygonFeatures: isPolygonFeature
  })
  return pump(source, dest)
}
