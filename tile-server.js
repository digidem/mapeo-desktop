var http = require('http')
var ecstatic = require('ecstatic')
var app = require('electron').app
var path = require('path')

var tilePath = path.join(app.getPath('userData'), 'tiles')

module.exports = function () {
  var server = http.createServer(
      ecstatic({ root: tilePath })
    )
  return server
}
