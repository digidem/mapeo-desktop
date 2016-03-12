var path = require('path')
var fs = require('fs')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var hyperlog = require('hyperlog')
var levelup = require('levelup')
var sqldown = require('sqldown')

var body = require('body/any')
var qs = require('querystring')
var exportGeoJson = require('./lib/geojson.js')
var pump = require('pump')
var shp = require('shpjs')
var tmpdir = require('os').tmpdir()
var unzip = require('unzip')
var mkdirp = require('mkdirp')

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
        var syncDb = levelup(params.source, {db: sqldown})
        var syncLog = hyperlog(syncDb, { valueEncoding: 'json' })
        syncLog.once('error', function (err) {
          error(500, res, err)
        })
        var s = syncLog.replicate()
        var d = osm.log.replicate()
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
    } else if (req.url === '/import.shp') {
      var dir = path.join(tmpdir, 'shapefile-' + Math.random())
      console.log(dir)
      mkdirp(dir, function (err) {
        var parser = unzip.Parse()
        req.pipe(parser)
        parser.on('entry', onentry)
        parser.once('finish', function () {
          console.log('FINISH', dir)
        })
      })
      function onentry (entry) {
        var outfile = path.join(dir, entry.path)
        if (!/^\.\./.test(path.relative(dir, outfile))) {
          entry.pipe(fs.createWriteStream(outfile))
        } else entry.resume()
      }
    } else st(req, res)
  })
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}

function errb (promise, cb) {
  promise.then(cb.bind(null, null))
  promise.catch(cb)
}
