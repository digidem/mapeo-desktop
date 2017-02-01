var osmserver = require('osm-p2p-server')
var http = require('http')
var sneakernet = require('hyperlog-sneakernet-replicator')
var net = require('net')

var body = require('body/any')
var qs = require('querystring')
var exportGeoJson = require('osm-p2p-geojson')
var importGeo = require('./lib/import-geo.js')
var pump = require('pump')
var shp = require('shpjs')
var concat = require('concat-stream')
var wsock = require('websocket-stream')
var eos = require('end-of-stream')
var randombytes = require('randombytes')

var userConfig = require('./lib/user-config')
var metadata = userConfig.getSettings('metadata')

var Bonjour = require('bonjour')
var HTTP_PORT = 3198

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  var replicating = false

  var networkId = 'Mapeo Desktop ' + randombytes(8).toString('hex')
  var syncTargets = []
  var bonjour = Bonjour()
  findSyncTargets()

  var server = http.createServer(function (req, res) {
    console.log(req.method, req.url)
    if (osmrouter.handle(req, res)) {
    } else if (req.method === 'POST' && req.url === '/replicate') {
      if (replicating) return error(400, res, 'Replication in progress.\n')
      body(req, res, function (err, params) {
        if (err) return error(400, res, err)
        replicateUsb(params.source)
        res.end('usb replication started\n')
      })
    } else if (req.url.split('?')[0] === '/sync_targets') {
      getSyncTargets(res)
    } else if (req.url.split('?')[0] === '/export.geojson') {
      var params = qs.parse(req.url.replace(/^[^\?]*?/, ''))
      var bbox = [
        [params.minlat, params.maxlat],
        [params.minlon, params.maxlon]
      ].map(function (pt) {
        if (pt[0] === undefined) pt[0] = -Infinity
        if (pt[1] === undefined) pt[1] = Infinity
        return pt
      })
      bbox = [bbox[0][0], bbox[1][0], bbox[0][1], bbox[1][1]]
      res.setHeader('content-type', 'text/json')
      pump(exportGeoJson(osm, {bbox: bbox}), res)
    } else if (req.url === '/import.shp' && /^(PUT|POST)/.test(req.method)) {
      req.pipe(concat(function (buf) {
        errb(shp(buf), function (err, geojsons) {
          if (err) return error(400, res, err)
          if (!(geojsons instanceof Array)) {
            geojsons = [geojsons]
          }
          var errors = []
          var pending = 1
          geojsons.forEach(function (geo) {
            importGeo(osm, geo, function (err) {
              if (err) errors.push(String(err.message || err))
              if (--pending === 0) done()
            })
          })
          if (--pending === 0) { done() }
          function done () {
            res.end(JSON.stringify({
              errors: errors
            }, null, 2))
          }
        })
      }))
    } else error(404, res, 'Not Found')
  })

  var replicationServer = net.createServer(function (socket) {
    console.log('received connection from', socket.address(), 'to replicate dataset', metadata.dataset_id)
    replicateNetwork(socket, 'push')
  })
  replicationServer.listen(function () {
    console.log('replication server live on port', replicationServer.address().port)

    // publish the replication service
    bonjour.publish({
      name: networkId,
      type: 'mapeo-sync',
      port: replicationServer.address().port,
      txt: {
        dataset_id: metadata.dataset_id || 'unknown'
      }
    })
  })

  var streams = {}
  wsock.createServer({ server: server }, function (stream) {
    var id = randombytes(8).toString('hex')
    streams[id] = stream
    eos(stream, function () { delete streams[id] })
  })

  server.replicateNetwork = replicateNetwork
  server.send = send
  server.shutdown = shutdown
  return server

  function shutdown () {
    bonjour.unpublishAll()
  }

  function findSyncTargets () {
    var browser = bonjour.find({ type: 'mapeo-sync' })

    browser.on('up', function (service) {
      // console.log('found a sync target', service)

      // Skip your own machine.
      if (service.name === networkId) {
        console.error('skipping sync target: it\'s me')
        return
      }

      // Skip targets with TXT entries.
      if (!service.txt || !service.txt.dataset_id) {
        console.error('skipping sync target: missing TXT entry')
        return
      }

      // If the dataset_id is 'unknown', it is a legacy client that doesn't
      // know what dataset it has. Prevent network sync in this case -- they
      // can use USB sync until they upgrade.
      if (service.txt.dataset_id === 'unknown') {
        console.error('skipping sync target: unknown dataset_id')
        return
      }

      // Skip sync services with different datasets.
      if (service.txt.dataset_id !== metadata.dataset_id) {
        console.error('skipping sync target: dataset_ids don\'t match')
        console.error('me=' + metadata.dataset_id + '   them=' + service.txt.dataset_id)
        return
      }

      syncTargets.push({
        id: service.name,
        name: service.host,
        host: service.referer.address,
        port: service.port,
        dataset_id: service.txt ? service.txt.dataset_id : 'unknown'
      })
    })

    browser.on('down', function (service) {
      syncTargets = syncTargets.filter(function (target) {
        return service.name !== target.id
      })
    })
  }

  function getSyncTargets (res) {
    res.end(JSON.stringify(syncTargets))
  }

  function replicateNetwork (socket, mode) {
    if (replicating) {
      send('replication-error', new Error('already replicating'))
      return
    }

    var pending = 2
    var src = osm.log.replicate({ mode: mode })
    replicating = true
    console.log('NET REPLICATION: starting')
    src.on('error', syncErr)
    socket.on('error', syncErr)
    socket.pipe(src).pipe(socket)
    eos(src, onend)
    eos(socket, onend)

    function onend () {
      if (--pending !== 0) return
      console.log('NET REPLICATION: done')
      replicating = false
      send('replication-data-complete')
      osm.ready(function () {
        console.log('NET REPLICATION: indexes caught up')
        send('replication-complete')
      })
    }
    function syncErr (err) {
      replicating = false
      send('replication-error', err.message)
      console.log('NET REPLICATION: err', err)
    }
  }

  function replicateUsb (sourceFile) {
    console.log('replicating to', sourceFile)
    replicating = true
    sneakernet(osm.log, { safetyFile: true }, sourceFile, onend)

    function onend (err) {
      if (err) return syncErr(err)
      replicating = false
      send('replication-data-complete')
      osm.ready(function () {
        console.log('COMPlETE')
        send('replication-complete')
      })
    }
    function syncErr (err) {
      replicating = false
      send('replication-error', err.message)
    }
  }
  function send (topic, msg) {
    var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
    Object.keys(streams).forEach(function (id) {
      streams[id].write(str)
    })
  }
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}

function errb (promise, cb) {
  promise.then(cb.bind(null, null))
  promise.catch(cb)
}
