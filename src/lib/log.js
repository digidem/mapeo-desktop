var path = require('path')
var fs = require('fs')
var Console = require('console')
var mkdir = require('mkdirp')
var wsock = require('websocket-stream')
var http = require('http')
var through = require('through2')

var nodeLogger = null
var browserLogger = null

var PORT = 17509

module.exports.Node = function () {
  if (!nodeLogger) {
    nodeLogger = setupNodeLogger()
  }
  return nodeLogger
}

module.exports.Browser = function () {
  if (!browserLogger) {
    browserLogger = setupBrowserLogger()
  }
  return browserLogger
}

function setupNodeLogger () {
  var electron = require('electron')

  // create log dir
  var logDir = path.join(electron.app.getPath('userData'), 'data', 'logs')
  mkdir.sync(logDir)

  // get electron app data dir
  var filename = (new Date()).toISOString().replace(':', '-') + '.txt'
  var logFilename = path.join(logDir, filename)

  // fs write stream to file
  var dest = fs.createWriteStream(logFilename)

  // through stream to multiplex to stdout
  var multi = multiplex([process.stdout, dest])

  // create console instance
  var log = new Console.Console(multi, null).log

  // start ws server
  websocketServer(function (socket) {
    socket.on('data', function (text) {
      multi.write(text)
    })
  })

  return log
}

function setupBrowserLogger () {
  var socket = wsock('ws://localhost:'+PORT)

  var browserConsole = window.console

  var stdout = through(function (chunk, enc, next) {
    browserConsole.log(chunk.toString())
    next()
  })

  // through stream to multiplex to stdout
  var multi = multiplex([stdout, socket])

  var c = new Console.Console(multi, null)

  // capture browser errors
  window.onerror = function (event, source, line, col) {
    c.log(event, '(' + source + ':' + line + ':' +  col + ')')
  }

  return c.log
}

function websocketServer (handler, done) {
  var server = http.createServer()
  var ws = wsock.createServer({ server: server }, handler)
  console.log('ws prepped')
  server.listen(PORT, function () {
    console.log('ws listening')
  })
}

function multiplex (froms) {
  return through(function (chunk, enc, next) {
    for (var i = 0; i < froms.length; i++) {
      try {
        froms[i].write(chunk.toString())
      } catch (e) {
        // TODO: catch this inside setupBrowserLogger and trigger some reconnect logic
      }
    }
    next()
  })
}
