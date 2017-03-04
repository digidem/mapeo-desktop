var clone = require('clone')
var ff = require('feature-filter-geojson')
var fc = require('@turf/helpers').featureCollection

var userConfig = require('./user-config')

// Accepts GeoJSON data; returns a map of layer names to GeoJSON data.
module.exports = function (geojson) {
  var layers = clone(userConfig.getSettings('layers'))

  var otherFilter = ['none']
  Object.keys(layers).forEach(function (name) {
    otherFilter.push(layers[name])
  })

  layers.other = otherFilter

  var res = {}

  var data = JSON.parse(geojson)
  for (var name in layers) {
    var layer = fc(data.features.filter(ff(layers[name])))
    var json = JSON.stringify(layer, null, 4)
    res[name] = json
  }

  return res
}
