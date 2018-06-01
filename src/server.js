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
  var replicating = false

  var server = http.createServer(function (req, res) {
    if (osmrouter.handle(req, res)) {
    } else if (req.method === 'POST' && req.url === '/sync/file') {
      if (replicating) return error(400, res, 'Replication in progress.\n')
      body(req, res, function (err, params) {
        if (err) return error(400, res, err)
        replicateFromFile(params.source)
        res.end('usb replication started\n')
      })
    } else error(404, res, 'Not Found')
    // TODO: add osmsync network routes
  })

  var streams = {}
  wsock.createServer({ server: server }, function (stream) {
    var id = randombytes(8).toString('hex')
    streams[id] = stream
    eos(stream, function () { delete streams[id] })
  })

  server.replicateNetwork = replicateNetwork
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

  function replicateNetwork (socket) {
    var emitter = sync.replicateNetwork(socket)
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
    Object.keys(streams).forEach(function (id) {
      streams[id].write(str)
    })
  }
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
