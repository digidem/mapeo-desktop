var path = require('path')
var os = require('os')
var MapeoServer = require('mapeo-server')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')

module.exports = function (osm, media, opts) {
  if (!opts) opts = {}
  var osmrouter = osmserver(osm)
  var mapeo = MapeoServer(osm, media, {
    staticRoot: opts.staticRoot,
    writeFormat: 'osm-p2p-syncfile'
  })

  mapeo.api.core.sync.setName(`Mapeo Desktop ${os.hostname()}`)
  mapeo.api.core.sync.listen()

  var server = http.createServer(function (req, res) {
    var staticHandler = ecstatic({
      root: path.join(__dirname, '..', '..', 'static'),
      baseDir: 'static'
    })

    var m = osmrouter.handle(req, res) || mapeo.handle(req, res)
    if (!m) {
      staticHandler(req, res, function (err) {
        if (err) console.error(err)
        res.statusCode = 404
        res.end('Not Found')
      })
    }
  })
  server.mapeo = mapeo
  return server
}
