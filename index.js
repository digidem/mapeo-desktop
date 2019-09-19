#!/usr/bin/env electron

var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow

var mkdirp = require('mkdirp')
var sublevel = require('subleveldown')
var osmdb = require('osm-p2p')
var series = require('run-series')
var MediaStore = require('safe-fs-blob-store')
var styles = require('mapeo-styles')
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer')

var ipc = require('./src/main/ipc')
var menuTemplate = require('./src/main/menu')
var createServer = require('./src/main/server.js')
var createTileServer = require('./src/main/tile-server.js')
var logger = require('./src/log')

var installStatsIndex = require('./src/main/osm-stats')
var TileImporter = require('./src/main/tile-importer')
var locale = require('./src/main/locale')

// HACK: enable GPU graphics acceleration on some older laptops
app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')

// Set up global node exception handler
handleUncaughtExceptions()

var log = null
var win = null
var splash = null

var gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Didn't get a lock, because another instance is open, so we quit
  process.exit(0)
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: path.join(userDataPath, 'kappa.db'),
    tileport: 5005
  },
  boolean: ['headless', 'debug'],
  alias: {
    p: 'port',
    t: 'tileport',
    d: 'debug'
  }
})

if (argv.headless) startSequence()
else app.once('ready', openWindow)

app.on('before-quit', function () {
  if (!app.server) return
  app.server.mapeo.api.close(function () {
    app.server.close()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

function openWindow () {
  var APP_NAME = app.getName()
  var INDEX = 'file://' + path.join(__dirname, './index.html')
  var SPLASH = 'file://' + path.join(__dirname, './splash.html')
  if (!win) {
    win = new BrowserWindow({
      title: APP_NAME,
      show: false,
      alwaysOnTop: false,
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'static', 'mapeo_256x256.png'),
      webPreferences: {
        nodeIntegration: true
      }
    })
    splash = new BrowserWindow({
      width: 810,
      height: 610,
      transparent: true,
      frame: false,
      alwaysOnTop: true
    })
    splash.loadURL(SPLASH)
  }

  installExtension(REACT_DEVELOPER_TOOLS)
    .then(name => console.log(`Added Extension:  ${name}`))
    .catch(err => console.log('An error occurred: ', err))

  app.translations = locale.load('es')
  win.loadURL(INDEX)

  var menu = Menu.buildFromTemplate(menuTemplate(app))
  Menu.setApplicationMenu(menu)

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    splash = null
    app.quit()
  })

  startSequence()
}

function startupMsg (txt) {
  return function (done) {
    console.log('[STARTUP] ' + txt)
    done()
  }
}

function startSequence () {
  // The app startup sequence
  series(
    [
      initDirectories,
      startupMsg('Initialized osm-p2p'),

      createServers,
      startupMsg('Started osm and tile servers'),

      notifyReady,
      startupMsg('Notified the frontend that backend is ready')
    ],
    function (err) {
      if (err) log('STARTUP FAILED', err)
      else log('STARTUP success!')
    }
  )
}

function initDirectories (done) {
  log = logger.Node()
  startupMsg('Unpacking Styles')
  // This is necessary to make sure that the styles and presets directory
  // are writable by the user
  mkdirp.sync(path.join(userDataPath, 'styles'))
  mkdirp.sync(path.join(userDataPath, 'presets'))
  mkdirp.sync(argv.datadir)
  styles.unpackIfNew(userDataPath, function (err) {
    if (err) log('[ERROR] while unpacking styles:', err)
  })

  var osm = osmdb(argv.datadir)
  log('loading datadir', argv.datadir)

  var idb = sublevel(osm.index, 'stats')
  osm.core.use('stats', installStatsIndex(idb))

  var media = MediaStore(path.join(argv.datadir, 'media'))
  app.osm = osm
  app.media = media
  app.tiles = TileImporter(userDataPath)

  win.webContents.once('did-finish-load', function () {
    log('preparing osm indexes..')
    win.webContents.send('indexes-loading')
    app.osm.ready(function () {
      log('indexes READY')
      win.webContents.send('indexes-ready')
    })
  })

  done()
}

function createServers (done) {
  app.server = createServer(app.osm, app.media, { staticRoot: userDataPath })
  app.mapeo = app.server.mapeo.api.core
  ipc(win)

  var pending = 2

  app.server.listen(argv.port, '127.0.0.1', function () {
    global.osmServerHost = '127.0.0.1:' + app.server.address().port
    log(global.osmServerHost)
    if (--pending === 0) done()
  })

  var tileServer = createTileServer()
  tileServer.listen(argv.tileport, function () {
    log('tile server listening on :', tileServer.address().port)
    if (--pending === 0) done()
  })
}

function notifyReady (done) {
  win.webContents.once('did-finish-load', function () {
    setTimeout(() => {
      var IS_TEST = process.env.NODE_ENV === 'test'
      if (IS_TEST) win.setSize(1000, 800, false)
      else win.maximize()
      if (argv.debug) win.webContents.openDevTools()
      splash.destroy()
      win.show()
      done()
    }, 1000)
  })
}

function handleUncaughtExceptions () {
  process.on('uncaughtException', function (error) {
    log = logger.Node()
    log('uncaughtException in Node:', error)
    if (app && win) win.webContents.send('error', error.stack)
  })
}
