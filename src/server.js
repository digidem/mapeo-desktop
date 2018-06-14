var path = require('path')
var mapeoserver = require('mapeo-server')
var osmserver = require('osm-p2p-server')
var http = require('http')

module.exports = function (osm, media) {
  var osmrouter = osmserver(osm)
  var staticRoot = path.dirname(require.resolve('mapeo-styles'))
  var mapeo = mapeoserver(osm, media, {staticRoot})

  var server = http.createServer(function (req, res) {
    var m = osmrouter.handle(req, res) || mapeo.handle(req, res)
    if (!m) {
      res.statusCode = 404
      res.end('Not Found')
    }
  })
  server.mapeo = mapeo
  return server
}
