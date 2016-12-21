var http = require('http')
var body = require('body/any')
var sneakernet = require('hyperlog-sneakernet-replicator')

var BroadcastServer = require('./broadcast_server')

var messages = {
  ReplicationDataComplete: 'replication-data-complete',
  ReplicationComplete: 'replication-complete',
  ReplicationError: 'replication-error'
}

module.exports = function (osm) {
  var replicating = false

  var httpServer = http.createServer(function (req, res) {
    console.error(req.method, req.url)

    if (req.method === 'POST' && req.url === '/replicate') {
      replicateRoute(req, res)
    } else {
      error(404, res, 'Not Found')
    }
  })

  var broadcast = BroadcastServer(httpServer)

  return httpServer

  function replicateRoute (req, res) {
    if (replicating) {
      return error(400, res, 'another replication is already in progress\n')
    }
    body(req, res, function (err, params) {
      if (err) {
        return error(400, res, err)
      }
      replicateUsb(params.source)
      res.end('usb replication started\n')
    })
  }

  function replicateUsb (sourceFile) {
    console.error('Replicating to', sourceFile)

    replicating = true

    sneakernet(osm.log, { safetyFile: true }, sourceFile, onEnd)

    function onEnd (err) {
      replicating = false

      if (err) {
        return onError(err)
      }

      broadcast(messages.ReplicationDataComplete)

      osm.ready(function () {
        console.error('Replication complete')
        broadcast(messages.ReplicationComplete)
      })
    }

    function onError (err) {
      broadcast(messages.ReplicationError, err.message)
    }
  }
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
