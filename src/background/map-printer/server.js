const Router = require('routes')
const HiddenMapbox = require('hidden-mapbox')
const { default: PQ } = require('p-queue')

const config = require('../../../config')
const logger = require('../../logger')

const CONCURRENCY = 4
const queue = new PQ({ concurency: CONCURRENCY })

const fallbackAccessToken = config.MAPBOX_ACCESS_TOKEN
const fallbackStyle = 'mapbox://styles/mapbox/outdoors-v10'

const getMapboxInstance = (() => {
  let cur = 0
  let instances
  // TODO: Should we remove and cleanup these instances after a timeout? To
  // avoid ongoing memory usage?
  return () => {
    if (!instances) {
      instances = new Array(CONCURRENCY)
        .fill(null)
        .map(() => new HiddenMapbox())
    }
    cur = (cur + 1) % CONCURRENCY
    return instances[cur]
  }
})()

var router = Router()

router.addRoute('/map/:lon/:lat/:zoom/:width/:height/x:pixelRatio.png', function (req, res, params) {
  const { searchParams } = new URL(req.url, 'http://' + req.headers.host)
  const { lon, lat, zoom, width, height, pixelRatio } = params

  const promise = queue.add(() => {
    const mapbox = getMapboxInstance()
    // TODO: Catch map errors (e.g. invalid style) and return error
    return mapbox.getMapImage({
      style: searchParams.get('style') || fallbackStyle,
      accessToken: searchParams.get('accessToken') || fallbackAccessToken,
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
    const { pathname } = new URL(req.url, 'http://' + req.headers.host)
    var route = router.match(pathname)
    if (!route) return false
    route.fn.apply(null, [req, res, route.params, route.splats])
    return true
  }
}
