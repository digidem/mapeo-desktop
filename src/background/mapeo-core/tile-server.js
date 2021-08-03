var http = require('http')
var ecstatic = require('ecstatic')
var series = require('run-series')

var logger = require('../../logger')

module.exports = function (userDataPath) {
  var guesses = ['png', 'jpg', 'jpeg']
  var routes = guesses.map(ext => {
    return ecstatic({
      root: userDataPath,
      defaultExt: ext
    })
  })
  var server = http.createServer(function (req, res) {
    var tasks = routes.map(route => {
      return done => route(req, res, done)
    })
    series(tasks, function (err) {
      if (err) logger.error('ERROR(tile-server):', err)
      res.statusCode = 404
      res.end('Not Found')
    })
  })
  return server
}
