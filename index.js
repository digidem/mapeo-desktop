#!/usr/bin/env electron

var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
const isDev = require('electron-is-dev')
var app = electron.app
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow

const debug = require('electron-debug')
var mkdirp = require('mkdirp')
var sublevel = require('subleveldown')
var osmdb = require('osm-p2p')
var series = require('run-series')
var MediaStore = require('safe-fs-blob-store')
var styles = require('mapeo-styles')

var ipc = require('./src/main/ipc')
var createMenu = require('./src/main/menu')
var createServer = require('./src/main/server.js')
var createTileServer = require('./src/main/tile-server.js')
var logger = require('electron-timber')
var windowStateKeeper = require('./src/main/window-state')

var installStatsIndex = require('./src/main/osm-stats')
var TileImporter = require('./src/main/tile-importer')

// HACK: enable GPU graphics acceleration on some older laptops
app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')

// Setup some handy dev tools shortcuts (only activates in dev mode)
// See https://github.com/sindresorhus/electron-debug
debug({ showDevTools: false })

// Handle uncaught errors
// catchErrors({ onError: handleError })

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

app.on('before-quit', function (e) {
  if (!app.server) return
  // Cancel quit and wait for server to close
  e.preventDefault()
  // Server close will gracefully close databases and wait for pending sync
  // TODO: Show the user that a sync is pending finishing
  app.server.close(function () {
    app.exit()
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
  var mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  if (!win) {
    win = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      title: APP_NAME,
      show: false,
      alwaysOnTop: false,
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'static', 'mapeo_256x256.png'),
      webPreferences: {
        nodeIntegration: true
      }
    })
    mainWindowState.manage(win)
    splash = new BrowserWindow({
      width: 810,
      height: 610,
      transparent: true,
      frame: false,
      alwaysOnTop: true
    })
    splash.loadURL(SPLASH)
  }

  if (isDev) {
    try {
      var {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')
    } catch (e) {}
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => logger.log(`Added Extension:  ${name}`))
      .catch(err => logger.log('An error occurred: ', err))
  }

  win.loadURL(INDEX)

  createMenu(app)

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
    logger.log('[STARTUP] ' + txt)
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
      if (err) logger.error('STARTUP FAILED', err)
      else logger.log('STARTUP success!')
    }
  )
}

function initDirectories (done) {
  startupMsg('Unpacking Styles')
  // This is necessary to make sure that the styles and presets directory
  // are writable by the user
  mkdirp.sync(path.join(userDataPath, 'styles'))
  mkdirp.sync(path.join(userDataPath, 'presets'))
  mkdirp.sync(argv.datadir)
  styles.unpackIfNew(userDataPath, function (err) {
    if (err) logger.error('[ERROR] while unpacking styles:', err)
  })

  var osm = osmdb(argv.datadir)
  logger.log('loading datadir', argv.datadir)

  var idb = sublevel(osm.index, 'stats')
  osm.core.use('stats', installStatsIndex(idb))

  var media = MediaStore(path.join(argv.datadir, 'media'))
  app.osm = osm
  app.media = media
  app.tiles = TileImporter(userDataPath)

  win.webContents.once('did-finish-load', function () {
    logger.log('preparing osm indexes..')
    win.webContents.send('indexes-loading')
    app.osm.ready(function () {
      logger.log('indexes READY')
      win.webContents.send('indexes-ready')
    })
  })

  done()
}

function createServers (done) {
  app.server = createServer(
    app.osm,
    app.media,
    win.webContents.send.bind(win.webContents),
    { staticRoot: userDataPath }
  )
  app.mapeo = app.server.mapeo
  ipc(win)

  var pending = 2

  app.server.listen(argv.port, '127.0.0.1', function () {
    global.osmServerHost = '127.0.0.1:' + app.server.address().port
    logger.log(global.osmServerHost)
    if (--pending === 0) done()
  })

  var tileServer = createTileServer()
  tileServer.listen(argv.tileport, function () {
    logger.log('tile server listening on :', tileServer.address().port)
    if (--pending === 0) done()
  })
}

function notifyReady (done) {
  win.webContents.once('did-finish-load', function () {
    setTimeout(() => {
      var IS_TEST = process.env.NODE_ENV === 'test'
      if (IS_TEST) win.setSize(1000, 800, false)
      if (argv.debug) win.webContents.openDevTools()
      splash.destroy()
      win.show()
      done()
    }, 1000)
  })
}

function handleError (error) {
  logger.error('uncaughtException in Node:', error)
  if (app && win) win.webContents.send('error', error.stack)
}
