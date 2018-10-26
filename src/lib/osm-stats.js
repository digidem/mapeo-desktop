var Index = require('hyperlog-index')
var sub = require('subleveldown')

module.exports = installStatsIndex

function installStatsIndex (osm) {
  var idb = sub(osm.db, 'stat2')
  var idx = Index({
    log: osm.log,
    db: idb,
    map: function (row, next) {
      if (row.value.k && row.value.v && row.value.v.type === 'node') {
        var node = row.value.v

        // update density map
        var binId = nodeToBinId(node)
        idb.get('bin/' + binId, function (err, num) {
          if (err && err.notFound) num = 0
          else if (err) return done(err)
          num = Number(num) + 1
          idb.put('bin/' + binId, num, next)
        })
      } else {
        next()
      }
    }
  })

  // install 'stats' property into osm object
  osm.stats = {
    getMapCenter: function (cb) {
      idx.ready(function () {
        var rs = idb.createReadStream({ gt: 'bin/!', lt: 'bin/~' })
        var mostDense = null
        rs.on('data', function (entry) {
          if (mostDense === null || Number(entry.value) > Number(mostDense.value)) {
            mostDense = entry
          }
        })
        rs.once('end', function () {
          if (!mostDense) return cb(null, null)
          var center = binIdToLatLon(mostDense.key.substring(4))
          cb(null, center)
        })
        rs.once('error', cb)
      })
    }
  }
}

function nodeToBinId (node) {
  var lat = Number(node.lat)
  var lon = Number(node.lon)
  if (Number.isNaN(lat) || lat === undefined || lat === null) return null
  if (Number.isNaN(lon) || lon === undefined || lon === null) return null
  var latbin = Math.round(lat * 50) / 50
  var lonbin = Math.round(lon * 50) / 50
  return latbin + ',' + lonbin
}

function binIdToLatLon (binId) {
  var lat = Number(binId.split(',')[0])
  var lon = Number(binId.split(',')[1])
  return {
    lat: lat,
    lon: lon
  }
}
