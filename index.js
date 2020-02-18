#!/usr/bin/env electron

const { ipcRenderer } = require('electron')
const path = require('path')
const minimist = require('minimist')
const electron = require('electron')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const debug = require('electron-debug')
const mkdirp = require('mkdirp')
const series = require('run-series')
const styles = require('mapeo-styles')
const logger = require('electron-timber')

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const MapeoRpc = require('./src/mapeo-worker')
const miscellaneousIpc = require('./src/main/ipc')
const createMenu = require('./src/main/menu')
const createTileServer = require('./src/main/tile-server')
const windowStateKeeper = require('./src/main/window-state')
const TileImporter = require('./src/main/tile-importer')

// HACK: enable GPU graphics acceleration on some older laptops
app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')

// Setup some handy dev tools shortcuts (only activates in dev mode)
// See https://github.com/sindresorhus/electron-debug
debug({ showDevTools: false })

// Handle uncaught errors
// XXX(KM): why aren't we enabling this?
// catchErrors({ onError: handleError })

var win = null
var splash = null

contextMenu({
  showLookUpSelection: false,
  showCopyImage: true,
  showSaveImageAs: true,
  showInspectElement: isDev
})

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

  var CLOSING = 'file://' + path.join(__dirname, './closing.html')
  var closingWin = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    show: false,
    alwaysOnTop: false
  })
  closingWin.loadURL(CLOSING)
  const closingTimeoutId = setTimeout(() => {
    closingWin.show()
  }, 300)

  // Server close will gracefully close databases and wait for pending sync
  // TODO: Show the user that a sync is pending finishing
  app.server.close(function () {
    clearTimeout(closingTimeoutId)
    try {
      closingWin.close()
    } catch (e) {}
    closingWin = null
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
      startupMsg('Initialized directories'),

      createServers,
      startupMsg('Started http servers and mapeo-rpc'),

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
  // TODO: run this in a separate window.
  // TODO: see internal code at src/mapeo-worker.js
  function ipcSend (command, payload) {
    if (win && win.webContents) {
      win.webContents.send('message-from-worker-to-UI', {
        command: command, payload: payload
      })
    }
  }
  app.mapeo = new MapeoRpc({
    userDataPath,
    datadir: argv.datadir,
    ipcSend
  })

  done()
}

function createServers (done) {
  // TODO: refactor tiles API.
  // Should this be it's own module to be re-used in Mm?
  app.tiles = TileImporter(userDataPath)

  // TODO: rename/refactor
  miscellaneousIpc(win)

  var pending = 2

  logger.log('initializing mapeo', userDataPath, argv.port)

  app.mapeo.listen(userDataPath, argv.port, (port) => {
    global.osmServerHost = '127.0.0.1:' + port
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

// function handleError (error) {
//   logger.error('uncaughtException in Node:', error)
//   if (app && win) win.webContents.send('error', error.stack)
// }
