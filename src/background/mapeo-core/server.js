var path = require('path')
var createMapeoRouter = require('mapeo-server')
var ecstatic = require('ecstatic')
var createOsmRouter = require('osm-p2p-server')
var { getDefaultConfigDir } = require('../../../config')
var logger = console

module.exports = function (osm, media, { ipcSend, staticRoot }) {
  var osmRouter = createOsmRouter(osm)

  const isDev = !window.mode || window.mode === 'development'

  const defaultConfigDir = getDefaultConfigDir(isDev)

  logger.debug(defaultConfigDir)

  var mapeoRouter = createMapeoRouter(osm, media, {
    staticRoot: staticRoot,
    writeFormat: 'osm-p2p-syncfile',
    deviceType: 'desktop',
    fallbackPresetsDir: getDefaultConfigDir(isDev)
  })

  var staticHandler = ecstatic({
    root: path.join(__dirname, '..', '..', 'static'),
    baseDir: 'static'
  })

  return {
    core: mapeoRouter.api.core,
    router: (req, res) => {
      var m = osmRouter.handle(req, res) || mapeoRouter.handle(req, res)

      if (!m) return done(req, res)
      if (m) {
        // TODO: make into regex for more robust checking
        if (req.url.indexOf('upload') > 0) {
          ipcSend('territory-edit')
        }
        if (req.url.indexOf('observation') > 0 && req.method === 'PUT') {
          ipcSend('observation-edit')
        }
      }
    }
  }

  function done (req, res) {
    staticHandler(req, res, function (err) {
      if (err) logger.error('static', err)
      res.statusCode = 404
      res.end('Not Found')
    })
  }
}
