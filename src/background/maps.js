const Router = require('routes')
const HiddenMapbox = require('hidden-mapbox')
const { default: PQ } = require('p-queue')

const config = require('../../config')
const logger = require('../logger')

const queue = new PQ({ concurrency: 1 })

const accessToken = config.MAPBOX_ACCESS_TOKEN
const style = 'mapbox://styles/mapbox/outdoors-v10'

var router = Router()
let mapbox

router.addRoute('/map/:lon/:lat/:zoom/:width/:height/x:pixelRatio.png', function (req, res, params) {
  const { lon, lat, zoom, width, height, pixelRatio } = params
  if (!mapbox) mapbox = new HiddenMapbox({accessToken, style})

  const promise = queue.add(() => {
    return mapbox.getMapImage({
      center: {lon, lat},
      zoom: parseInt(zoom),
      width: parseInt(width),
      height: parseInt(height),
      pixelRatio: parseInt(pixelRatio)
    })
  })

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
