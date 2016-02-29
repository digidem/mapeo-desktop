var path = require('path')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var osmdb = require('osm-p2p')
var body = require('body/any')

var st = ecstatic(path.join(__dirname, 'public'))
var vst = ecstatic(path.join(__dirname, 'vendor/ideditor'))

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  return http.createServer(function (req, res) {
    console.log(req.method, req.url)
    if (osmrouter.handle(req, res)) {}
    else if (/^\/(data|dist|css)\//.test(req.url)) {
      vst(req, res)
    } else if (req.method === 'POST' && req.url === '/replicate') {
      body(req, res, function (err, params) {
        if (err) return error(400, res, err)
        var exdb = osmdb(params.source)
        exdb.once('error', function (err) {
          error(500, res, err)
        })
        var s = srcdb.replicate()
        var d = osm.replicate()
        var pending = 2
        s.once('end', onend)
        d.once('end', onend)
        s.pipe(d).pipe(s)
        function onend () {
          if (--pending !== 0) return
          res.end('ok\n')
        }
      })
    } else if (req.url === '/replicate') {
      req.url = '/replicate.html'
      st(req, res)
    } else st(req, res)
  })
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
