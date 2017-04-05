var exportGeoJson = require('osm-p2p-geojson')

var userConfig = require('./user-config')
var presets = userConfig.getSettings('presets')

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
  return exportGeoJson(osm, {
    bbox: bbox,
    map: featureMap,
    polygonFeatures: isPolygonFeature
  })
}
