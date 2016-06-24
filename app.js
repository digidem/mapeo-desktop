#!/usr/bin/env electron

var path = require('path')
var fs = require('fs')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.

var menuTemplate = require('./lib/menu')

if (require('electron-squirrel-startup')) return

var APP_NAME = app.getName()

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: path.join(userDataPath, 'data'),
    tileport: 5005
  },
  boolean: [ 'headless', 'debug' ],
  alias: {
    p: 'port',
    t: 'tileport',
    d: 'debug'
  }
})

var oldUserDataPath = require('application-config-path')('ecuador-map-editor')
var hasOldUserData = true

try {
  fs.statSync(oldUserDataPath)
} catch (e) {
  hasOldUserData = false
}

// Migrate old data if needed
if (hasOldUserData) {
  mv(path.join(oldUserDataPath, 'data'), path.join(userDataPath, 'data'))
  mv(path.join(oldUserDataPath, 'tiles'), path.join(userDataPath, 'tiles'))
  mv(path.join(oldUserDataPath, 'imagery.json'), path.join(userDataPath, 'imagery.json'))
  mv(path.join(oldUserDataPath, 'presets.json'), path.join(userDataPath, 'presets.json'))
}

var osmdb = require('osm-p2p')
var osm = osmdb(argv.datadir)

var createServer = require('./server.js')
var server = createServer(osm)

var pending = 2

server.listen(argv.port, '127.0.0.1', function () {
  global.osmServerHost = '127.0.0.1:' + server.address().port
  console.log(global.osmServerHost)
  ready()
})

var tileServer = require('./tile-server.js')()
tileServer.listen(argv.tileport, '127.0.0.1', function () {
  console.log('tile server listening on :', server.address().port)
})

if (!argv.headless) {
  app.on('ready', ready)
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    app.quit()
  })
}

var win = null
var menu = null

function ready () {
  if (--pending !== 0) return
  if (argv.headless) return
  var INDEX = 'file://' + path.resolve(__dirname, './index.html')
  win = new BrowserWindow({title: APP_NAME})
  win.maximize()
  if (argv.debug) win.webContents.openDevTools()
  win.loadURL(INDEX)

  var ipc = electron.ipcMain

  require('./lib/user-config')

  ipc.on('open-dir', function () {
    electron.dialog.showOpenDialog(win, {
      title: 'select USB media for replication',
      properties: [ 'openDirectory' ],
      filters: []
    }, onopen)

    function onopen (filenames) {
      if (typeof filenames === 'undefined') return
      if (filenames.length === 1) {
        var dir = filenames[0]
        win.webContents.send('select-dir', dir)
      }
    }
  })

  menu = Menu.buildFromTemplate(menuTemplate(app))
  Menu.setApplicationMenu(menu)

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    app.quit()
  })
}

// Move a file, but only if the old one exists and the new one doesn't
function mv (src, dst) {
  try {
    fs.statSync(src)
  } catch (e) {
    return
  }
  try {
    fs.statSync(dst)
  } catch (e) {
    fs.rename(src, dst)
  }
}
