/**
 * Takes a hash of preset definitions and returns a matcher function
 * that will take a geoJSON feature object as an argument and return
 * the matching preset. Preset matching is based on matching tags,
 * with presets that match more tags having a high score / more likely
 * to be matched
 * @param {Object} presets iD Presets file see https://github.com/openstreetmap/iD/blob/master/data/presets/README.md
 * @return {Function} Match function that takes a feature and returns the matching preset or null
 */
module.exports = function presetMatcher (presets) {
  // Index of presets by (geometry, tag key).
  var index = {
    point: {},
    vertex: {},
    line: {},
    area: {},
    relation: {}
  }

  for (var name in presets) {
    var preset = Object.assign({}, presets[name], {
      id: name
    })
    var geometry = preset.geometry || []

    for (var j = 0; j < geometry.length; j++) {
      var g = index[geometry[j]]
      for (var k in preset.tags) {
        k = k.replace(':', '_')
        ;(g[k] = g[k] || []).push(preset)
      }
    }
  }

  return match

  function match (feature) {
    var geometry
    if (!feature.geometry) return null

    switch (feature.geometry.type) {
      case 'Point':
        geometry = 'point'
        break
      case 'LineString':
        geometry = 'line'
        break
      case 'Polygon':
        geometry = 'area'
        break
    }

    var geometryMatches = index[geometry] || {}
    var best = -1
    var match

    for (var k in feature.properties) {
      var keyMatches = geometryMatches[k]
      if (!keyMatches) continue

      for (var i = 0; i < keyMatches.length; i++) {
        var score = matchScore(keyMatches[i], feature.properties)
        if (score > best) {
          best = score
          match = keyMatches[i]
        }
      }
    }

    return match || null
  }
}

/**
 * Returns a 'score' for a preset match based on how many props match
 * the preset. Presets can also include a wildcard `*` for tags, which is
 * not as high score as a specific match e.g. a preset waterway=river will
 * override a preset waterway=*
 * @param {Object} preset Preset obejct
 * @param {Object} props  Hash of feature properties
 * @return {Number} Score of how well the preset matches
 */
function matchScore (preset, props) {
  var tags = preset.tags || {}
  var score = 0
  var matchScore = preset.matchScore || 1

  for (var t in tags) {
    var t2 = t.replace(':', '_')
    if (props[t2] === tags[t]) {
      score += matchScore
    } else if (tags[t] === '*' && t2 in props) {
      score += matchScore / 2
    } else {
      return -1
    }
  }

  return score
}
