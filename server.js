var path = require('path')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var hyperlog = require('hyperlog')
var level = require('level')

var body = require('body/any')
var qs = require('querystring')
var exportGeoJson = require('./lib/export-geo.js')
var importGeo = require('./lib/import-geo.js')
var pump = require('pump')
var shp = require('shpjs')
var tmpdir = require('os').tmpdir()
var concat = require('concat-stream')
var wsock = require('websocket-stream')
var onend = require('end-of-stream')
var randombytes = require('randombytes')

module.exports = function (osm) {
  var osmrouter = osmserver(osm)
  var replicating = false

  var server = http.createServer(function (req, res) {
    console.log(req.method, req.url)
    if (osmrouter.handle(req, res)) {
    } else if (req.method === 'POST' && req.url === '/replicate') {
      if (replicating) return error(400, res, 'Replication in progress.\n')
      body(req, res, function (err, params) {
        if (err) return error(400, res, err)
        replicate(params.source)
        res.end('replication started\n')
      })
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
    } else if (req.url === '/import.shp' && /^(PUT|POST)/.test(req.method)) {
      req.pipe(concat(function (buf) {
        errb(shp(buf), function (err, geojsons) {
          if (err) return error(400, res, err)
          if (!(geojsons instanceof Array)) {
            geojsons = [geojsons]
          }
          var errors = [], pending = 1
          geojsons.forEach(function (geo) {
            importGeo(osm, geo, function (err) {
              if (err) errors.push(String(err.message || err))
              if (--pending === 0) done()
            })
          })
          if (--pending === 0) done()
          function done () {
            res.end(JSON.stringify({
              errors: errors
            }, null, 2))
          }
        })
      }))
    } else error(404, res, 'Not Found')
  })

  var streams = {}
  wsock.createServer({ server: server }, function (stream) {
    var id = randombytes(8).toString('hex')
    streams[id] = stream
    onend(stream, function () { delete streams[id] })
  })
  return server

  function replicate (sourcedir) {
    var syncDb = level(sourcedir)
    var syncLog = hyperlog(syncDb, { valueEncoding: 'json' })
    syncLog.on('error', syncErr)
    var s = syncLog.replicate()
    var d = osm.log.replicate()
    var pending = 2
    onend(s, onend)
    onend(d, onend)
    s.on('error', syncErr)
    d.on('error', syncErr)
    s.pipe(d).pipe(s)

    function onend () {
      if (--pending !== 0) return
      replicating = false
      send('replication-data-complete')
      setTimeout(function () {
        osm.ready(function () {
          console.log('COMPlETE')
          send('replication-complete')
        })
      }, 5000) // HACK, figure out how to not do this in the future
    }
    function syncErr (err) {
      replicating = false
      send('replication-error', err.message)
    }
  }
  function send (topic, msg) {
    var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
    Object.keys(streams).forEach(function (id) {
      streams[id].write(str)
    })
  }
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}

function errb (promise, cb) {
  promise.then(cb.bind(null, null))
  promise.catch(cb)
}
