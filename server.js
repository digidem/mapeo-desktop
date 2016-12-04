var http = require('http')
var body = require('body/any')

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
    console.log('would be replicating to', sourceFile)
    // TODO(sww): replication logic
  }
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
