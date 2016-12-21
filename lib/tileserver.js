var http = require('http')

var finalhandler = require('finalhandler')
var Router = require('router')
var tilelive = require('tilelive-cache')(require('tilelive'))
require('tilelive-modules/loader')(tilelive)

var config = require('../config')

module.exports = function (tileUri) {
  var router = Router()

  router.get('/:z(\\d+)/:x(\\d+)/:y(\\d+).vector.pbf', function (req, res) {
    var z = req.params.z | 0
    var x = req.params.x | 0
    var y = req.params.y | 0

    return tilelive.load(tileUri, function (err, src) {
      if (err) {
        res.statusCode = 500
        return res.end(err.message)
      }

      return src.getTile(z, x, y, function (err, data, headers) {
        if (err) {
          res.statusCode = 404
          return res.end()
        }

        Object.keys(headers).forEach(function (k) {
          var v = headers[k]
          res.setHeader(k, v)
        })

        return res.end(data)
      })
    })
  })

  router.get('/index.json', function (req, res) {
    return tilelive.load(tileUri, function (err, src) {
      if (err) {
        console.warn(err.stack)
        res.statusCode = 500
        return res.end(err.message)
      }

      return src.getInfo(function (err, info) {
        if (err) {
          res.statusCode = 500
          return res.end(err.message)
        }

        info.tiles = [
          `http://${config.servers.tiles.host}:${config.servers.tiles.port}/{z}/{x}/{y}.vector.pbf`
        ]

        return res.end(JSON.stringify(info))
      })
    })
  })

  return http.createServer(function (req, res) {
    router(req, res, finalhandler(req, res))
  })
}
