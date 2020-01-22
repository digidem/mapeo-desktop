var concat = require('concat-stream')
var mock = require('mock-data')
var mkdirp = require('mkdirp')
var hyperquest = require('hyperquest')
var debug = require('debug')('mapeo-mock-device')
var path = require('path')
var Mapeo = require('mapeo-server')
var blobstore = require('safe-fs-blob-store')
var osmdb = require('osm-p2p')
var http = require('http')
var config = require('../src/main/user-config')

const MOCK_DATA = 500

const userDataPath = // ENTER YOUR USER DATA PATH HERE, e.g., /home/username/.config/Mapeo

module.exports = createMockDevice

function createMockDevice (dir, opts) {
  if (!opts) opts = {}
  mkdirp.sync(path.join(dir, 'osm'))
  mkdirp.sync(path.join(dir, 'media'))
  opts.projectKey = config.getEncryptionKey(userDataPath)
  console.log('projectKey', opts.projectKey)
  var osm = osmdb(path.join(dir, 'osm'), { encryptionKey: opts.projectKey })
  var media = blobstore(path.join(dir, 'media'))
  var mapeo = Mapeo(osm, media, opts)
  mapeo.api.core.sync.setName('My Fake Android Device #1')
  var server = http.createServer(function (req, res) {
    if (!mapeo.handle(req, res)) {
      res.statusCode = 404
      res.end('404')
    }
  })
  server.on('error', function (err) {
    console.trace(err)
  })

  server.on('close', function () {
    console.log('closing mapeo')
    server.mapeo.api.close()
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

  server.listen(port, function () {
    server.mapeo.api.core.sync.listen(cb)
  })
}

function call (url, cb) {
  var hq2 = hyperquest.get(url, {})
  hq2.pipe(concat({ encoding: 'string' }, function (body) {
    debug('announced', body)
    if (cb) return cb(body)
  }))
  hq2.end()
}

function openSyncScreen (cb) {
  var server = this
  var port = server.address().port
  debug('announcing')
  call(`http://localhost:${port}/sync/join`, cb)
}

function closeSyncScreen (cb) {
  var server = this
  debug('unannouncing')
  var port = server.address().port
  call(`http://localhost:${port}/sync/leave`, cb)
}

function createMockData (count, cb) {
  if (!cb) {
    cb = count
    count = 1
  }
  var bounds = [-78.3155, -3.3493, -74.9871, 0.6275]
  bounds = bounds.map((b) => b * 100)

  var server = this
  var port = server.address().port
  var base = `http://localhost:${port}`
  var original = path.join(__dirname, '..', 'test', 'media', 'original.jpg')
  var thumbnail = path.join(__dirname, '..', 'test', 'media', 'thumbnail.jpg')
  var preview = path.join(__dirname, '..', 'test', 'media', 'preview.jpg')

  mock.generate({
    type: 'integer',
    count: count,
    params: { start: bounds[0], end: bounds[2] }
  }, function (err, lons) {
    if (err) throw err
    mock.generate({
      type: 'integer',
      count: count,
      params: { start: bounds[1], end: bounds[3] }
    }, function (err, lats) {
      if (err) throw err
      lons.forEach((lon, i) => {
        var obs = {
          type: 'observation',
          lat: lats[i] / 100,
          lon: lon / 100,
          timestamp: new Date(),
          tags: {
            notes: '',
            observedBy: 'user-' + Math.floor(Math.random() * 10)
          }
        }
        createObservation(obs)
      })
    })
  })

  function createObservation (obs) {
    if (obs.lat < -90 || obs.lat > 90 || obs.lon < -180 || obs.lon > 180) return console.error('observation has lon/lat out of range:', obs)
    var hq = hyperquest.post(base + '/media')
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

      obs.attachments = [{
        id: obj.id,
        type: 'image/jpeg'
      }]

      hq.end(JSON.stringify(obs))
    }))

    hq.end(JSON.stringify({ original, thumbnail, preview }))
  }
}

function shutdown (cb) {
  var server = this
  server.mapeo.api.close(function () {
    server.close(cb)
  })
}

if (require.main === module) {
  var args = process.argv.splice(2)
  var dir = args[0] || path.join(__dirname, 'test-data')
  var device = createMockDevice(dir)

  var port = args[1] || DEFAULT_PORT
  console.log(port, dir)

  device.turnOn(port, function () {
    console.log('listening on port', device.address().port)
    device.createMockData(MOCK_DATA, function () {
    })
    device.openSyncScreen(function () {
      console.log('announced')
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
