const Router = require('routes')
const HiddenMapbox = require('hidden-mapbox')
const { default: PQ } = require('p-queue')

const config = require('../../config')
const logger = require('../logger')

const CONCURRENCY = 4
const queue = new PQ({ concurency: CONCURRENCY })

const accessToken = config.MAPBOX_ACCESS_TOKEN
const style = 'mapbox://styles/mapbox/outdoors-v10'

const getMapboxInstance = (() => {
  let cur = 0
  let instances
  // TODO: Should we remove and cleanup these instances after a timeout? To
  // avoid ongoing memory usage?
  return () => {
    if (!instances) {
      instances = new Array(CONCURRENCY)
        .fill(null)
        .map(() => new HiddenMapbox({ accessToken, style }))
    }
    cur = (cur + 1) % CONCURRENCY
    return instances[cur]
  }
})()

var router = Router()

router.addRoute('/map/:lon/:lat/:zoom/:width/:height/x:pixelRatio.png', function (req, res, params) {
  const { lon, lat, zoom, width, height, pixelRatio } = params

  const promise = queue.add(() => {
    const mapbox = getMapboxInstance()
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
      // Cache static maps in the browser for 15 minutes
      res.setHeader('Cache-Control', 'public, max-age=900')
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
