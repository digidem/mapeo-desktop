var path = require('path')
var ecstatic = require('ecstatic')
var osmdb = require('osm-p2p')
var osmserver = require('osm-p2p-server')

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  default: { port: 5000, datadir: './data' },
  alias: { p: 'port', d: 'datadir' }
})

var st = ecstatic(path.join(__dirname, 'public'))
var osm = osmdb(argv.datadir)
var osmrouter = osmserver(osm)

var http = require('http')
var server = http.createServer(function (req, res) {
  if (osmrouter.handle(req, res)) {}
  else st(req, res)
})
server.listen(argv.port)

server.on('listening', function () {
  console.log('http://127.0.0.1:' + server.address().port)
})
