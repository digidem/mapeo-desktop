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
var Settings = require('@mapeo/settings')
var argv = require('minimist')(process.argv.slice(2))

const MOCK_DATA = require('../fixtures/observations.json').slice(0,5)
const DEFAULT_PORT = 5006

let settings, projectKey

module.exports = createMockDevice

if (require.main === module) {
  var userDataPath = argv._[0] || path.join(__dirname, 'test-data')
  var port = argv._[1] || argv.port || DEFAULT_PORT
  var presets = argv.settings
  settings = new Settings(userDataPath)
  if (!presets) main()
  else {
    settings.importSettings(presets, function (err) {
      if (err) throw err
      main()
    })
  }
}

function main () {
  var device = createMockDevice(userDataPath)

  device.turnOn(port, function () {
    console.log('listening on port', device.address().port)
    device.createMockData(function () {
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

function createMockDevice (userDataPath, opts) {
  if (!opts) opts = {}
  mkdirp.sync(path.join(userDataPath, 'osm'))
  mkdirp.sync(path.join(userDataPath, 'media'))
  projectKey = settings.getEncryptionKey(userDataPath)
  opts.projectKey = projectKey
  console.log('osmdb using projectKey', projectKey)
  var osm = osmdb({
    dir: path.join(userDataPath, 'osm'),
    encryptionKey: projectKey
  })
  var media = blobstore(path.join(userDataPath, 'media'))
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

function openSyncScreen (cb) {
  var server = this
  // TODO: LOL fix this nonsense
  console.log('joining projectKey', projectKey)
  server.mapeo.api.core.sync.join(projectKey)
}

function closeSyncScreen (cb) {
  var server = this
  // TODO: i am thoroughly embarassed
  server.mapeo.api.core.sync.leave(projectKey)
}

function createMockData (cb) {
  var server = this
  var port = server.address().port
  var base = `http://localhost:${port}`
  var original = path.join(__dirname, '..', 'test', 'media', 'original.jpg')
  var thumbnail = path.join(__dirname, '..', 'test', 'media', 'thumbnail.jpg')
  var preview = path.join(__dirname, '..', 'test', 'media', 'preview.jpg')

  MOCK_DATA.map((observation) => {
    observation.type = 'observation'
    delete observation.attachments
    createObservation(observation)
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
