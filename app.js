#!/usr/bin/env electron

var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app  // Module to control application life.
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.

var APP_NAME = 'Mapeo CEIBO'

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: path.join(userDataPath, 'data')
  },
  boolean: [ 'headless', 'debug' ],
  alias: {
    p: 'port',
    d: 'datadir',
    d: 'debug'
  }
})

var osmdb = require('osm-p2p')
var osm = osmdb(argv.datadir)

var createServer = require('./server.js')
var server = createServer(osm)

var pending = 2
server.listen(argv.port, '127.0.0.1', function () {
  var href = 'http://127.0.0.1:' + server.address().port
  console.log(href)
  ready()
})

if (!argv.headless) {
  app.on('ready', ready)
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    app.quit()
  })
}

var win = null

function ready () {
  if (--pending !== 0) return
  if (argv.headless) return
  var href = 'http://127.0.0.1:' + server.address().port + '/'
  win = new BrowserWindow({title: APP_NAME})
  win.maximize()
  if (argv.debug) win.webContents.openDevTools()
  win.loadURL(href)

  var ipc = electron.ipcMain
  ipc.on('open-dir', function () {
    electron.dialog.showOpenDialog(win, {
      title: 'select USB media for replication',
      properties: [ 'openDirectory' ],
      filters: []
    }, onopen)

    function onopen (filenames) {
      if (filenames.length === 1) {
        var dir = filenames[0]
        win.webContents.send('select-dir', dir)
      }
    }
  })

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    app.quit()
  })
}
