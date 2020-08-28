var Router = require('routes')
var HiddenMapbox = require('hidden-mapbox')
var logger = require('../logger')
var { default: PQ } = require('p-queue')

const queue = new PQ({ concurrency: 1 })

const accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
const style = 'mapbox://styles/mapbox/outdoors-v10'

var router = Router()
let mapbox

router.addRoute('/map/:lon/:lat/:zoom/:width/:height/x:pixelRatio.png', function (req, res, params) {
  const { lon, lat, zoom, width, height, pixelRatio } = params
  if (!mapbox) mapbox = new HiddenMapbox({accessToken, style})

  const promise = queue.add(() => mapbox.getMapImage({
    center: {lon, lat},
    zoom: parseInt(zoom),
    width: parseInt(width),
    height: parseInt(height),
    pixelRatio: parseInt(pixelRatio)
  }))

  const onError = (err) => {
    logger.error(err)
    res.statusCode = 500
    res.end(err.message)
  }

  promise
    .then((blob) => {
      res.setHeader('Content-Type', 'image/png')
      blob.arrayBuffer()
        .then((buf) => {
          res.end(Buffer.from(buf))
        })
        .catch(onError)
    })
    .catch(onError)
})

module.exports = {
  handle: (req, res) => {
    var route = router.match(req.url)
    if (!route) return false
    route.fn.apply(null, [req, res, route.params, route.splats])
    return true
  }
}
