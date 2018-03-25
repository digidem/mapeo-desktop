var osmserver = require('osm-p2p-server')
var http = require('http')
var sneakernet = require('hyperlog-sneakernet-replicator')
var net = require('net')
var osmGeoJson = require('osm-p2p-geojson')

var body = require('body/any')
var parseUrl = require('url').parse
var exportGeoJson = require('./lib/export-geojson')
var wsock = require('websocket-stream')
var eos = require('end-of-stream')
var randombytes = require('randombytes')

var userConfig = require('./lib/user-config')
var metadata = userConfig.getSettings('metadata')

var Bonjour = require('bonjour')

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  var replicating = false

  var networkId = 'Mapeo Desktop ' + randombytes(8).toString('hex')
  var syncTargets = []
  var bonjour = Bonjour()
  findSyncTargets()

  var server = http.createServer(function (req, res) {
    console.log(req.method, req.url)
    var params = parseUrl(req.url, true).query
    var bbox = [params.minlon, params.minlat, params.maxlon, params.maxlat]
      .map(function (pt, i) {
        return typeof pt !== 'undefined' ? pt : i < 2 ? -Infinity : Infinity
      })
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
      res.setHeader('content-type', 'text/json')
      bbox = [[bbox[0], bbox[2]], [bbox[1], bbox[3]]]
      exportGeoJson(osm, bbox).pipe(res)
    } else if (req.url === '/import.shp' && /^(PUT|POST)/.test(req.method)) {
      function done (err) {
        res.end(JSON.stringify({
          errors: err
        }, null, 2))
      }
      var importer = osmGeoJson.importer(osm)
      importer.importFeatureCollection(req, done)
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

    // Root around in hyperlog's guts to fake progress events
    var replicateOrig = osm.log.replicate
    osm.log.replicate = function () {
      var stream = replicateOrig.call(osm.log)
      stream.on('data', onProgress)
      return stream
    }

    sneakernet(osm.log, { safetyFile: true }, sourceFile, onend)

    function onProgress () {
      send('replication-progress')
    }

    function onend (err) {
      if (err) return syncErr(err)

      osm.log.replicate = replicateOrig

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
