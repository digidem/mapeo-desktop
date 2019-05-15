var through = require('through2')

function createZoomToDataIndex (ldb) {
  return {
    maxBatch: 100,
    map: function (nodes, next) {
      var bins = {}
      var pending = 1
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        if (!node.value) continue
        if (typeof node.value.lat !== 'number' || typeof node.value.lon !== 'number') continue

        // update density map
        var binId = nodeToBinId(node.value)
        if (bins[binId]) {
          bins[binId]++
        } else {
          pending++
          ldb.get(binId, function (err, num) {
            if (err && err.notFound) num = 0
            else if (err) return next(err)
            if (bins[binId]) bins[binId]++
            else bins[binId] = num + 1
            if (!--pending) finish()
          })
        }
      }
      if (!--pending) finish()

      function finish () {
        var keys = Object.keys(bins)
        var ops = []
        for (var i = 0; i < keys.length; i++) {
          ops.push({
            type: 'put',
            key: keys[i],
            value: bins[keys[i]]
          })
        }
        if (ops.length > 0) ldb.batch(ops, next)
        else next()
      }
    },
    storeState: function (state, cb) {
      ldb.put('state', state, { valueEncoding: 'binary' }, cb)
    },
    fetchState: function (cb) {
      ldb.get('state', { valueEncoding: 'binary' }, function (err, state) {
        if (err && err.notFound) cb()
        else if (err) cb(err)
        else cb(null, state)
      })
    },
    clearIndex: function (cb) {
      // TODO: mutex to prevent other view APIs from running?
      var batch = []
      ldb.createKeyStream()
        .pipe(through(function (key, _, next) {
          batch.push({ type: 'del', key: key })
          next()
        }, function (flush) {
          ldb.batch(batch, function () {
            flush()
            cb()
          })
        }))
    },
    api: {
      getMapCenter: function (core, type, cb) {
        if (typeof type === 'function' && !cb) {
          cb = type
          type = 'node'
        }
        this.ready(function () {
          var rs = ldb.createReadStream({ gt: 'ztd/' + type + '!', lt: 'ztd/' + type + '~' })
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
}

module.exports = createZoomToDataIndex

function nodeToBinId (node) {
  var lat = Number(node.lat)
  var lon = Number(node.lon)
  if (Number.isNaN(lat) || lat === undefined || lat === null) return null
  if (Number.isNaN(lon) || lon === undefined || lon === null) return null
  var latbin = Math.round(lat * 50) / 50
  var lonbin = Math.round(lon * 50) / 50
  return 'ztd/' + node.type + '/' + latbin + ',' + lonbin
}

function binIdToLatLon (binId) {
  binId = binId.split('/')[1]
  var lat = Number(binId.split(',')[0])
  var lon = Number(binId.split(',')[1])
  return {
    lat: lat,
    lon: lon
  }
}
