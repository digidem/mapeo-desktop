#!/usr/bin/env electron

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: './data'
  },
  boolean: [ 'headless', 'debug' ],
  alias: {
    p: 'port',
    d: 'datadir',
    d: 'debug'
  }
})

var osmdb = require('osm-p2p')
var osm = osmdb(argv.dir)

var createServer = require('./server.js')
var server = createServer(osm)

var pending = 2
server.listen(argv.port, function () {
  var href = 'http://127.0.0.1:' + server.address().port
  console.log(href)
  ready()
})

var app = require('app')
var Window = require('browser-window')
app.on('ready', ready)

function ready () {
  if (--pending !== 0) return
  if (argv.headless) return
  var href = 'http://127.0.0.1:' + server.address().port + '/'
  var win = new Window()
  if (argv.debug) win.webContents.openDevTools();
  win.loadURL(href)
}
