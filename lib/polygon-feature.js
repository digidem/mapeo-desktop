var forEach = require('lodash/forEach')

module.exports = polygonFeature

/**
 * Takes a hash of preset definition and returns an `isPolygon` function
 * that will take a geoJSON feature object as an argument and return a boolean
 * indicating if the feature is a polygon
 * @param {Object} presets iD Presets file see https://github.com/openstreetmap/iD/blob/master/data/presets/README.md
 * @return {Function} isPolygon function that will return boolean whether polygon or not
 */
function polygonFeature (presets) {
  var areaKeys = {}
  var ignore = ['barrier', 'highway', 'footway', 'railway', 'type']

  // whitelist
  forEach(presets, function (d) {
    for (var key in d.tags) break
    if (!key) return
    if (ignore.indexOf(key) !== -1) return

    if (d.geometry.indexOf('area') !== -1) {
      areaKeys[key] = areaKeys[key] || {}
    }
  })

  // blacklist
  forEach(presets, function (d) {
    for (var key in d.tags) break
    if (!key) return
    if (ignore.indexOf(key) !== -1) return

    var value = d.tags[key]
    if (d.geometry.indexOf('area') === -1 &&
                d.geometry.indexOf('line') !== -1 &&
                key in areaKeys && value !== '*') {
      areaKeys[key][value] = true
    }
  })

  return function isPolygon (coords, tags) {
    tags = tags || {}
    if (tags.area === 'yes') return true
    if (!isClosed(coords) || tags.area === 'no') return false
    for (var key in tags) {
      if (key in areaKeys && !(tags[key] in areaKeys[key])) {
        return true
      }
    }
    return false
  }
}

function isClosed (coords) {
  if (coords.length === 0) return false
  var coords1 = coords[0]
  var coords2 = coords[coords.length - 1]
  if (!coords1 || !coords2) return false
  return coords1[0] === coords2[0] && coords1[1] === coords2[1]
}
