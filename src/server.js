var mapeoserver = require('mapeo-server')
var osmserver = require('osm-p2p-server')
var http = require('http')

module.exports = function (osm, media) {
  var osmrouter = osmserver(osm)
  var mapeo = mapeoserver(osm, media)

  var server = http.createServer(function (req, res) {
    if (osmrouter.handle(req, res)) {
    } else if (mapeo(req, res)) {
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }
  })
  server.sync = mapeo.sync
  return server
}
