var url = require('url')
var querystring = require('querystring')
var osmserver = require('osm-p2p-server')
var osmsync = require('osm-p2p-sync')
var http = require('http')

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
    } else if (req.method === 'GET') {
      console.log('replicating', replicating)
      if (req.url.startsWith('/sync/start')) {
        var query = url.parse(req.url).query
        if (!query) return onerror(res, 'Requires filename or host and port')
        var params = querystring.parse(query)
        if (replicating) return onerror(res, 'Failed: only one replication allowed at a time.')
        replicating = true
        var progress
        if (params.filename) {
          progress = sync.replicateFromFile(params.filename)
        } else if (params.host && params.port) {
          progress = sync.syncToTarget(params)
        } else return onerror(res, 'Requires filename or host and port')
        send(res, 'replication-started')
        progress.on('error', onend)
        progress.on('end', onend)
      }
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }

    function onend (err) {
      replicating = false
      if (err) return onerror(res, err.message)
      send(res, 'replication-data-complete')
      osm.ready(function () {
        send(res, 'replication-complete')
        res.end()
      })
    }

    function send (res, topic, msg) {
      var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
      res.write(str)
    }

    function onerror (res, err) {
      replicating = false
      res.statusCode = 400
      var str = JSON.stringify({topic: 'replication-error', message: err.message || err}) + '\n'
      res.end(str)
    }
  })

  sync.on('error', function (err) {
    console.error(err)
  })
  server.sync = sync
  return server
}
