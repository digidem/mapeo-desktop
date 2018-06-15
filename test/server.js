var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var path = require('path')
var Mapeo = require('mapeo-server')
var blobstore = require('safe-fs-blob-store')
var osmdb = require('osm-p2p')
var http = require('http')

var dir = path.join(__dirname, 'test-data')
var osm = osmdb(path.join(dir, 'osm'))
var media = blobstore(path.join(dir, 'media'))

var port = 5006

mkdirp.sync(dir)
var ws = media.createWriteStream('file.txt')
ws.write('hi')
ws.end()
var mapeo = Mapeo(osm, media)
var server = http.createServer(function (req, res) {
  if (!mapeo(req, res)) {
    res.statusCode = 404
    res.end('404')
  }
})

server.listen(port, function () {
  console.log('listening on port', port)
})

process.on('SIGINT', function () {
  mapeo.api.close(function () {
    console.log('closing')
    process.exit()
  })
})
