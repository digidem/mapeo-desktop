var path = require('path')
var createMapeoRouter = require('mapeo-server')
var ecstatic = require('ecstatic')
var createOsmRouter = require('osm-p2p-server')
var { getDefaultConfigDir } = require('../../../config')
var logger = console

// Enable CORS fetching in development since we use a development server for the requester
const ALLOW_CORS_RESPONSE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, Cache-Control, Pragma'
}

module.exports = function (osm, media, { ipcSend, staticRoot, isDev }) {
  var osmRouter = createOsmRouter(osm)

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
    baseDir: 'static',
    ...(isDev
      ? { handleOptionsMethod: true, headers: ALLOW_CORS_RESPONSE_HEADERS }
      : {})
  })

  return {
    core: mapeoRouter.api.core,
    router: (req, res) => {
      if (isDev) {
        for (const [header, value] of Object.entries(
          ALLOW_CORS_RESPONSE_HEADERS
        )) {
          res.setHeader(header, value)
        }
      }

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
