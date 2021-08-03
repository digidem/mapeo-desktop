var through = require('through2')

function createZoomToDataIndex (ldb) {
  return {
    maxBatch: 100,
    map: function (nodes, next) {
      var bins = {}
      var pending = 1
      for (var i = 0; i < nodes.length; i++) {
        // !!Important!! Need const here for node, binId and delete, because if
        // var is used, it is hoisted to the top of this function, and will
        // have a different value when the ldb.get callback is called. const and
        // let are scoped to this for expression, and will retain their value in
        // the callback
        const node = nodes[i]
        if (!node.value) continue
        if (
          typeof node.value.lat !== 'number' ||
          typeof node.value.lon !== 'number'
        )
          continue
        // update density map
        const binId = nodeToBinId(node.value)
        const deleted = node.value.deleted
        if (typeof bins[binId] === 'number') {
          deleted ? bins[binId]-- : bins[binId]++
        } else {
          pending++
          ldb.get(binId, function (err, val) {
            let num
            if (err && err.notFound) num = 0
            else if (err) return next(err)
            else num = Number(val)
            if (typeof bins[binId] === 'number') {
              deleted ? bins[binId]-- : bins[binId]++
            } else {
              bins[binId] = deleted ? num - 1 : num + 1
            }
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
      ldb.createKeyStream().pipe(
        through(
          function (key, _, next) {
            batch.push({ type: 'del', key: key })
            next()
          },
          function (flush) {
            ldb.batch(batch, function () {
              flush()
              cb()
            })
          }
        )
      )
    },
    api: {
      getMapCenter: function (core, types, cb) {
        if (typeof types === 'function' && !cb) {
          cb = types
          types = ['node']
        }
        if (!Array.isArray(types)) {
          types = [types]
        }
        let mostDense = null

        this.ready(async () => {
          try {
            for (const type of types) {
              await streamType(type)
            }
            if (!mostDense) return cb(null, null)
            var center = binIdToLatLon(mostDense.key.substring(4))
            cb(null, center)
          } catch (err) {
            cb(err)
          }
        })

        async function streamType (type) {
          return new Promise((resolve, reject) => {
            var rs = ldb.createReadStream({
              gt: 'ztd/' + type + '!',
              lt: 'ztd/' + type + '~'
            })
            rs.on('data', function (entry) {
              if (
                mostDense === null ||
                Number(entry.value) > Number(mostDense.value)
              ) {
                mostDense = entry
              }
            })
            rs.once('end', resolve)
            rs.once('error', reject)
          })
        }
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
  // Store in bins 0.01° square ~ 1.1km at equator
  var latbin = Math.floor(lat * 50)
  var lonbin = Math.floor(lon * 50)
  return 'ztd/' + node.type + '/' + latbin + ',' + lonbin
}

function binIdToLatLon (binId) {
  binId = binId.split('/')[1]
  // Get center of bin
  var lat = (Number(binId.split(',')[0]) + 0.5) / 50
  var lon = (Number(binId.split(',')[1]) + 0.5) / 50
  return {
    lat: lat,
    lon: lon
  }
}
