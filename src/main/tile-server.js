var http = require('http')
var ecstatic = require('ecstatic')
var app = require('electron').app
var path = require('path')
var series = require('run-series')
const { log } = require('electron-log')

var tilePath = path.join(app.getPath('userData'))

module.exports = function () {
  var guesses = ['png', 'jpg', 'jpeg']
  var routes = guesses.map(ext => {
    return ecstatic({
      root: tilePath,
      defaultExt: ext
    })
  })
  var server = http.createServer(function (req, res) {
    var tasks = routes.map(route => {
      return done => route(req, res, done)
    })
    series(tasks, function (err) {
      if (err) log('ERROR(tile-server):', err)
      res.statusCode = 404
      res.end('Not Found')
    })
  })
  return server
}
