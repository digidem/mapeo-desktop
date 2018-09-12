var concat = require('concat-stream')
var hyperquest = require('hyperquest')
var debug = require('debug')('mapeo-mock-device')
var path = require('path')
var Mapeo = require('mapeo-server')
var blobstore = require('safe-fs-blob-store')
var osmdb = require('osm-p2p')
var http = require('http')

module.exports = createMockDevice

function createMockDevice (dir) {
  var osm = osmdb(path.join(dir, 'osm'))
  var media = blobstore(path.join(dir, 'media'))
  var mapeo = Mapeo(osm, media)
  var server = http.createServer(function (req, res) {
    if (!mapeo.handle(req, res)) {
      res.statusCode = 404
      res.end('404')
    }
  })

  server.mapeo = mapeo
  server.shutdown = shutdown
  server.shutdown.bind(server)
  server.turnOn = turnOn
  server.turnOn.bind(server)
  server.openSyncScreen = openSyncScreen
  server.openSyncScreen.bind(server)
  server.closeSyncScreen = closeSyncScreen
  server.closeSyncScreen.bind(server)
  server.createMockData = createMockData
  server.createMockData.bind(server)
  return server
}

var DEFAULT_PORT = 5006

function turnOn (opts, cb) {
  var server = this
  if (typeof opts === 'number' || typeof opts === 'string') opts = { port: opts }
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  var port = opts.port || DEFAULT_PORT

  server.listen(port, cb)
}

function openSyncScreen (cb) {
  var server = this
  if (server.interval) return cb()
  server.interval = setInterval(function () {
    debug('announcing')
    var port = server.address().port
    var hq2 = hyperquest.get(`http://localhost:${port}/sync/announce`, {})
    hq2.pipe(concat({ encoding: 'string' }, function (body) {
      debug('announced', body)
      if (cb) return cb(body)
    }))
    hq2.end()
  }, 2000)
}

function closeSyncScreen (cb) {
  var server = this
  if (!server.interval) return cb()
  clearInterval(server.interval)
  server.interval = undefined
  debug('unannouncing')
  var port = server.address().port
  var hq2 = hyperquest.get(`http://localhost:${port}/sync/unannounce`, {})
  hq2.pipe(concat({ encoding: 'string' }, function (body) {
    debug('unannounced', body)
    if (cb) return cb(body)
  }))
  hq2.end()
}

function createMockData (cb) {
  var server = this
  var port = server.address().port
  var base = `http://localhost:${port}`
  var fpath = encodeURIComponent(path.join(__dirname, 'image.jpg'))
  var href = base + '/media?file=' + fpath

  var hq = hyperquest.put(href, {})
  hq.pipe(concat({ encoding: 'string' }, function (body) {
    var hq = hyperquest.post(base + '/observations', {
      headers: { 'content-type': 'application/json' }
    })
    var obj = JSON.parse(body)

    hq.on('response', function (res) {
      if (res.statusCode !== 200) cb(new Error('create observation failed', res))
    })

    hq.pipe(concat({ encoding: 'string' }, function (body) {
      debug('created observation', body)
      if (cb) cb(null, body)
    }))

    var obs = {
      type: 'observation',
      lat: 0.4,
      lon: 1,
      attachments: [ {
        id: obj.id
      }]
    }

    hq.end(JSON.stringify(obs))
  }))

  hq.end()
}

function shutdown (cb) {
  var server = this
  clearInterval(server.interval)
  server.interval = undefined
  server.closed = true
  server.on('close', function () {
    server.mapeo.api.close(cb)
  })
  server.close()
}

if (require.main === module) {
  var dir = path.join(__dirname, 'test-data')
  var device = createMockDevice(dir)

  var port = process.argv.splice(2)[0] || DEFAULT_PORT

  device.turnOn(port, function () {
    console.log('listening on port', device.address().port)
    device.createMockData(function () {
      console.log('opening sync screen')
      device.openSyncScreen(function () {
        console.log('announced')
      })
    })
  })

  process.on('SIGINT', function () {
    debug('shutting down')
    device.shutdown(function () {
      console.log('device finished shut down')
      process.exit()
    })
  })
}
