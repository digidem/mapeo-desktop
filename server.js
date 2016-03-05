var path = require('path')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var osmdb = require('osm-p2p')
var body = require('body/any')
var qs = require('querystring')
var exportGeoJson = require('./lib/geojson.js')
var pump = require('pump')

var st = ecstatic(path.join(__dirname, 'public'))
var vst = ecstatic(path.join(__dirname, 'vendor/ideditor'))

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  return http.createServer(function (req, res) {
    console.log(req.method, req.url)
    if (osmrouter.handle(req, res)) {}
    else if (/^\/(data|dist|css|img)\//.test(req.url)) {
      vst(req, res)
    } else if (req.method === 'POST' && req.url === '/replicate') {
      body(req, res, function (err, params) {
        if (err) return error(400, res, err)
        var exdb = osmdb(params.source)
        exdb.once('error', function (err) {
          error(500, res, err)
          cleanup()
        })
        var s = exdb.log.replicate()
        var d = osm.log.replicate()
        var pending = 2
        s.once('end', onend)
        d.once('end', onend)
        s.pipe(d).pipe(s)
        function onend () {
          if (--pending !== 0) return
          res.end('ok\n')
          cleanup()
        }
        function cleanup () {
          exdb.db.close()
        }
      })
    } else if (req.url === '/replicate') {
      req.url = '/replicate.html'
      st(req, res)
    } else if (req.url.split('?')[0] === '/export.geojson') {
      var params = qs.parse(req.url.replace(/^[^\?]*?/, ''))
      var bbox = [[params.minlat,params.maxlat],[params.minlon,params.maxlon]]
        .map(function (pt) {
          if (pt[0] === undefined) pt[0] = -Infinity
          if (pt[1] === undefined) pt[1] = Infinity
          return pt
        })
      res.setHeader('content-type', 'text/json')
      pump(exportGeoJson(osm, bbox), res)
    } else st(req, res)
  })
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
