var Router = require('routes')
var mapStream = require('mapbox-map-image-stream')

var fileCacheMiddleware = require('./cache')
var logger = require('../logger')

var token = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
var style = 'mapbox://styles/mapbox/outdoors-v10'

var router = Router()

function getAsset (req, res, params) {
  const { bbox, width, height, dpi } = params
  return {
    contentType: 'image/png',
    contentLength: 1000,
    stream: mapStream({
      token: token,
      style: style,
      bbox: JSON.parse(bbox),
      width: parseInt(width),
      height: parseInt(height),
      pixelRatio: parseInt(dpi)
    })
  }
}

var cache = fileCacheMiddleware(getAsset, { maxSize: 10 * 1024 * 1024 * 1024 })

router.addRoute('/map/:bbox/:width/:height/x:dpi.png', function (req, res, params) {
  cache(req, res, params, (err) => {
    if (err) {
      logger.error(err)
      res.statusCode = 500
      res.end(err.message)
    }
  })
})

module.exports = {
  handle: (req, res) => {
    var route = router.match(req.url)
    if (!route) return false
    route.fn.apply(null, [req, res, route.params, route.splats])
    return true
  }
}

