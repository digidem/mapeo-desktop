var path = require('path')
var fs = require('fs')
var drivelist = require('drivelist')
var mapeoserver = require('mapeo-server')
var ecstatic = require('ecstatic')
var osmserver = require('osm-p2p-server')
var http = require('http')
var parallel = require('run-parallel')

module.exports = function (osm, media) {
  var osmrouter = osmserver(osm)
  var staticRoot = path.dirname(require.resolve('mapeo-styles'))
  var mapeo = mapeoserver(osm, media, {
    staticRoot,
    writeFormat: 'osm-p2p-syncfile'
  })

  var server = http.createServer(function (req, res) {
    function onerror (err) {
      res.end(JSON.stringify({ error: err.message }))
    }

    var staticHandler = ecstatic({
      root: path.join(__dirname, '..', 'static'),
      baseDir: 'static'
    })

    var m = osmrouter.handle(req, res) || mapeo.handle(req, res)
    if (req.url === '/datasets') {
      res.setHeader('Content-Type', 'application/json')
      drivelist.list(function (err, drives) {
        if (err) return onerror(err)
        drives = drives.filter((drive) => drive.isUSB)
        getDatasets(drives, function (err, datasets) {
          if (err) return onerror(err)
          res.end(JSON.stringify(datasets))
        })
      })
      return
    }
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

function getDatasets (drives, cb) {
  var tasks = []

  drives.forEach((drive) => {
    var task = ((drive) => {
      return (cb) => {
        fs.readdir(drive, (err, list) => {
          if (err) return cb(err)
          cb(null, list.filter((file) => path.extname(file) === '.mapeosync'))
        })
      }
    })(drive)
    tasks.push(task)
  })

  parallel(tasks, function (err, datasets) {
    if (err) return cb(err)
    cb(null, [].concat.apply([], datasets))
  })
}
