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
  var host = id
  var sync = osmsync(osm, {id, host})
  var replicating = false

  var server = http.createServer(function (req, res) {
    if (osmrouter.handle(req, res)) {
    } else if (req.url === '/sync/targets') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(sync.targets))
    } else if (req.method === 'POST') {
      body(req, res, function (err, params) {
        if (err) return onerror(400, res, err)
        if (req.url === '/sync/start') {
          if (replicating) return onerror(400, res, new Error('Failed: only one replication allowed at a time.'))
          replicating = true
          if (params.filename) replicateFromFile(params.filename)
          else if (params.host && params.port) replicateWifi(params)
          res.end('replication started\n')
        }
      })
    } else onerror(404, res, 'Not Found')
  })

  var stream = null
  wsock.createServer({ server: server }, function (socket) {
    // question: broadcast on mdns all the time or only when requested?
    try {
      sync.listen()
    } catch (err) {
      console.error(err)
    }
    stream = socket
    eos(socket, function () { stream = null })
  })

  function send (topic, msg) {
    var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
    if (stream) stream.write(str)
  }

  function onerror (code, res, err) {
    res.statusCode = code
    res.end((err.message || err) + '\n')
  }

  sync.on('error', function (err) {
    console.error(err)
  })
  server.sync = sync
  return server

  function onend (err) {
    replicating = false
    if (err) return send('replication-error', err.message)
    send('replication-data-complete')
    osm.ready(function () {
      send('replication-complete')
    })
  }

  function replicateWifi (target) {
    var emitter = sync.syncToTarget(target)
    emitter.on('error', onend)
    emitter.on('end', onend)
    // TODO: real progress events.
    send('replication-progress')
  }

  function replicateFromFile (filename) {
    var emitter = sync.replicateFromFile(filename)
    emitter.on('error', onend)
    emitter.on('end', onend)
    emitter.on('progress', function () {
      send('replication-progress')
    })
  }
}
