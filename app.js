#!/usr/bin/env electron

var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.

require('electron-debug')({showDevTools: false})

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

function parseArguments (args) {
  return minimist(args, {
    default: {
      port: 5000,
      datadir: path.join(userDataPath, 'data')
    },
    boolean: [ 'headless', 'debug' ],
    alias: {
      p: 'port',
      d: 'debug'
    }
  })
}

function start (argv) {
  if (!argv.headless) {
    app.on('ready', onAppReady)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      app.quit()
    })
  }
}

function onAppReady () {
  setupWindow()
  setupMenu()

  function setupWindow () {
    var indexHtml = 'file://' + path.resolve(__dirname, './index.html')
    var win = createWindow(indexHtml)

    win.on('closed', function () {
      app.quit()
    })
  }

  function setupMenu () {
    var template = require('./lib/menu')(app)
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}

function createWindow (indexFile) {
  var win = new BrowserWindow({title: app.getName(), show: false})
  win.once('ready-to-show', () => win.show())
  win.maximize()
  win.loadURL(indexFile)

  return win
}

var argv = parseArguments(process.argv.slice(2))
start(argv)
