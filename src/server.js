var osmserver = require('osm-p2p-server')
var osmsync = require('osm-p2p-sync')
var http = require('http')

var body = require('body/any')
var wsock = require('websocket-stream')
var eos = require('end-of-stream')
var randombytes = require('randombytes')

var userConfig = require('./lib/user-config')

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  var id = 'MapeoDesktop_' + randombytes(8).toString('hex')
  var sync = osmsync(osm, {id})

  var server = http.createServer(function (req, res) {
    if (osmrouter.handle(req, res)) {
    } else if (req.method === 'POST') {
      body(req, res, function (err, params) {
        if (err) return onerror(400, res, err)
        if (req.url === '/sync/file') {
          replicateFromFile(params.filename)
          res.end('usb replication started\n')
        } else if (req.url === '/sync/wifi') {
          replicateWifi(params)
          res.end('wifi replication started\n')
        }
      })
    } else onerror(404, res, 'Not Found')
  })

  var stream = null
  wsock.createServer({ server: server }, function (socket) {
    osmsync.mdns()
    stream = socket
    eos(socket, function () {
      stream = null
    })
    osmsync.on('up', function (service) {
      send('up', service)
    })
    osmsync.on('down', function (service) {
      send('down', service)
    })
  })

  server.send = send
  server.shutdown = function () { sync.close() }
  return server

  function replicationEnd (err) {
    if (err) return send('replication-error', err.message)
    send('replication-data-complete')
    osm.ready(function () {
      send('replication-complete')
    })
  }

  function replicateWifi (target) {
    var emitter = sync.syncToTarget(target)
    emitter.on('error', replicationEnd)
    emitter.on('end', replicationEnd)
    // TODO: real progress events.
    send('replication-progress')
  }

  function replicateFromFile (sourceFile) {
    var emitter = sync.replicateFromFile(sourceFile)
    emitter.on('error', replicationEnd)
    emitter.on('end', replicationEnd)
    emitter.on('progress', function () {
      send('replication-progress')
    })
  }

  function send (topic, msg) {
    var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
    if (stream) stream.write(str)
  }

  function onerror (code, res, err) {
    res.statusCode = code
    res.end((err.message || err) + '\n')
  }
}
