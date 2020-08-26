var Router = require('routes')
var { render } = require('mbgl-renderer')
var Core = require('@mapeo/core')


var fileCacheMiddleware = require('./cache-sync')
var logger = require('../logger')
var errors = Core.errors

var token = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
var style = 'mapbox://styles/mapbox/outdoors-v10'

var router = Router()

async function getAsset (req, res, params) {
  const { bbox, width, height, dpi } = params
  var buffer = await render(style, parseInt(width), parseInt(height), {
    token: token,
    bbox: JSON.parse(bbox),
    ratio: parseInt(dpi)
  })

  return {
    type: 'image/png',
    size: buffer.length,
    buffer
  }
}

var cache = fileCacheMiddleware(getAsset, {
  maxSize: 10 * 1024 * 1024 * 1024,
  logger
})

router.addRoute('/map/:bbox/:width/:height/x:dpi.png', function (req, res, params) {
  cache(req, params, (err) => {
    if (err) {
      logger.error(err)
      errors.send(res, err)
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
