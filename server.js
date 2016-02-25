var path = require('path')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')

var st = ecstatic(path.join(__dirname, 'public'))
var vst = ecstatic(path.join(__dirname, 'vendor/ideditor'))

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  return http.createServer(function (req, res) {
    console.log(req.method, req.url)
    if (osmrouter.handle(req, res)) {}
    else if (/^\/(data|dist|css)\//.test(req.url)) {
      vst(req, res)
    } else st(req, res)
  })
}
