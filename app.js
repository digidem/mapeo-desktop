#!/usr/bin/env electron

var path = require('path')
var fs = require('fs')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.
var net = require('net')

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
    app.on('ready', appReady)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      app.quit()
    })
  }
}

function appReady () {
  var indexHtml = 'file://' + path.resolve(__dirname, './index.html')
  var menuTemplate = require('./lib/menu')(app)

  createWindow(indexHtml)
  createMenu(menuTemplate)

  function createWindow (indexFile) {
    var win = new BrowserWindow({title: app.getName(), show: false})
    win.once('ready-to-show', () => win.show())
    win.maximize()
    if (argv.debug) win.webContents.openDevTools()
    win.loadURL(indexFile)

    win.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
      app.quit()
    })
  }

  function createMenu (template) {
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}


var argv = parseArguments(process.argv.slice(2))
start(argv)
