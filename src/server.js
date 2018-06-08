var mapeoserver = require('mapeo-server')
var osmserver = require('osm-p2p-server')
var http = require('http')

module.exports = function (osm, media) {
  var osmrouter = osmserver(osm)
  var mapeo = mapeoserver(osm, media)

  var server = http.createServer(function (req, res) {
    var m = osmrouter.handle(req, res) || mapeo(req, res)
    if (!m) {
      res.statusCode = 404
      res.end('Not Found')
    }
  })
  server.sync = mapeo.sync
  return server
}
