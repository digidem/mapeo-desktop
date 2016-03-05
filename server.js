var path = require('path')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var osmdb = require('osm-p2p')
var body = require('body/any')
var qs = require('querystring')
var xtend = require('xtend')
var jsonstream = require('jsonstream')
var pump = require('pump')
var through = require('through2')

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
    } else if (req.url.split('?')[0] === '/export') {
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

function exportGeoJson (osm, bbox) {
  var rstream = osm.queryStream(bbox)
  var str = jsonstream.stringify()
  var wrap = through({}, null, function end (next) {
    this.push('}\n')
    next()
  })
  wrap.push('{ "type": "FeatureCollection", "features": ')
  return pump(
    rstream,
    through.obj(write, end),
    str, wrap
  )
  function write (row, enc, next) {
    var self = this
    if (row.type === 'node') {
      this.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.lon,row.lat]
        },
        properties: xtend(row.tags || {}, {
          id: row.id,
          version: row.version
        })
      })
      next()
    } else if (row.type === 'way') {
      var pending = 1
      var coords = []
      ;(row.refs || []).forEach(function (ref, ix) {
        pending++
        osm.get(ref, function (err, docs) {
          if (docs) {
            var doc = docs[Object.keys(docs)[0]] // for now
            coords[ix] = [doc.lon,doc.lat]
          }
          if (--pending === 0) done()
        })
      })
      if (--pending === 0) done()
      function done () {
        self.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: coords
          },
          properties: xtend(row.tags || {}, {
            id: row.id,
            version: row.version
          })
        })
        next()
      }
    } else next()
  }
  function end (next) {
    next()
  }
}
