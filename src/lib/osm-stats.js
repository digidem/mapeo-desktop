var Index = require('hyperlog-index')
var sub = require('subleveldown')

module.exports = installStatsIndex

function installStatsIndex (osm) {
  var idb = sub(osm.db, 'stat')
  var idx = Index({
    log: osm.log,
    db: idb,
    map: function (row, next) {
      if (row.value.k && row.value.v && row.value.v.type === 'node') {
        var node = row.value.v
        // console.log('indexing', row.key)
        getIndexState(function (err, stats) {
          if (err) return next(err)
          stats.latSum += Number(node.lat)
          stats.lonSum += Number(node.lon)
          stats.numNodes++
          // console.log('writing stats', stats)
          writeIndexState(next)
        })
      } else {
        next()
      }
    }
  })

  var stats

  // install 'stats' property into osm object
  osm.stats = {
    getMapCenter: function (cb) {
      idx.ready(function () {
        getIndexState(function (err, stats) {
          if (err) return cb(err)
          var center = {
            lat: stats.latSum / stats.numNodes,
            lon: stats.lonSum / stats.numNodes,
          }
          return cb(null, center)
        })
      })
    }
  }

  function writeIndexState (cb) {
    var batch = [
      { type: 'put', key: 'lat-sum', value: stats.latSum },
      { type: 'put', key: 'lon-sum', value: stats.lonSum },
      { type: 'put', key: 'num-nodes', value: stats.numNodes }
    ]
    // console.log('writing batch stats index', batch)
    idb.batch(batch, cb)
  }

  function getIndexState (cb) {
    if (stats) {
      return process.nextTick(cb.bind(null, null, stats))
    }

    idb.get('lat-sum', function (err, latSum) {
      if (err && !err.notFound) return next(err)
      if (err && err.notFound) latSum = 0
      idb.get('lon-sum', function (err, lonSum) {
        if (err && !err.notFound) return next(err)
        if (err && err.notFound) lonSum = 0
        idb.get('num-nodes', function (err, numNodes) {
          if (err && !err.notFound) return next(err)
          if (err && err.notFound) numNodes = 0
          stats = {
            latSum: Number(latSum),
            lonSum: Number(lonSum),
            numNodes: Number(numNodes)
          }
          cb(null, stats)
        })
      })
    })
  }
}
