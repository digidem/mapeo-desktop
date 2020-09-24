#!/usr/bin/env electron
const path = require('path')
const minimist = require('minimist')
const electron = require('electron')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const debug = require('electron-debug')
const mkdirp = require('mkdirp')
const series = require('run-series')
const styles = require('mapeo-styles')
const chmod = require('chela').mod

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const createMenu = require('./src/main/menu')
const updater = require('./src/main/auto-updater')
const userConfig = require('./src/main/user-config')
const Main = require('./src/main')
const logger = require('./src/logger')
const electronIpc = require('./src/main/ipc')
const windowStateKeeper = require('./src/main/window-state')

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

// HACK: enable GPU graphics acceleration on some older laptops
app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
app.commandLine.appendSwitch('ignore-certificate-errors')

// Command line arguments
var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: path.join(userDataPath, 'kappa.db'),
    tileport: 5005,
    mapPrinterPort: 5010
  },
  boolean: ['headless', 'debug'],
  alias: {
    p: 'port',
    t: 'tileport',
    d: 'debug'
  }
})

// Setup some handy dev tools shortcuts (only activates in dev mode)
// See https://github.com/sindresorhus/electron-debug
debug({ showDevTools: false })

var exiting = false

// Before we do anything, let's make sure we're ready to gracefully shut down
const onExit = require('capture-exit')
const signalExit = require('signal-exit')
onExit.captureExit()
onExit.onExit(beforeQuit)
signalExit(beforeQuit, { alwaysLast: true })
app.on('before-quit', (e) => {
  // Cancel quit and wait for server to close
  if (e) e.preventDefault()
  beforeQuit()
})

// Window Management
var win = null
var splash = null
var mainWindowState = null
var didFinishLoad = false

// Ensure only one instance can be open at a time
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

// Configure the logger before we do anything
if (!logger.configured) {
  logger.configure({
    label: 'main',
    userDataPath,
    isDev
  })
}

// Set up Electron main process manager
const main = new Main({
  userDataPath,
  isDev
})

function onError (err) {
  logger.error(err)
  electron.dialog.showErrorBox('Error', err)
}

main.on('error', onError)

if (argv.headless) main.ready().then(startSequence())
else {
  app.whenReady().then(() => {
    splash = createSplashWindow()
    splash.on('closed', () => {
      beforeQuit()
    })
    splash.webContents.on('did-finish-load', openWindow)
  })
}

// First, open the Electron 'splash' AKA loading window with animation
function openWindow () {
  logger.info('openWindow')

  if (isDev) {
    // for updater to work correctly
    process.env.APPIMAGE = path.join(__dirname, 'dist', `Installar_Mapeo_v${app.getVersion()}_linux.AppImage`)
    try {
      var {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')
    } catch (e) {}
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => logger.debug(`Added Extension:  ${name}`))
      .catch(err => logger.error('Failed to add extension', err))
  }

  // When the main process is ready to go
  var onMainReady = () => {
    win = createWindow(main.mapeo.name)
    // Emitted when the window is closed
    win.on('closed', function (e) {
      beforeQuit()
    })

    createMenu(main.mapeo.ipc)

    // Start Mapeo core
    // In dev mode, we use an electron background window
    // for the mapeo core process so we can use the chrome debugger
    // In production, mapeo core should always be in a node process
    if (isDev) {
      // this will get destroyed on app.exit()
      var BG = 'file://' + path.join(__dirname, './src/background/mapeo-core/index.html')
      createBgWindow(main.mapeo.name, BG)
    } else {
      // this will get destroyed during beforeQuit with main.close()
      main.startMapeoNodeIPC()
    }

    // Start map printer
    // this will get destroyed on app.exit()
    var BG2 = 'file://' + path.join(__dirname, './src/background/map-printer/index.html')
    createBgWindow(main.mapPrinter.name, BG2)

    // Start sequence
    startSequence()
  }

  const mainReady = main.ready()
  mainReady.then(onMainReady).catch(onError)
}

// Some convenience function for logging
function startupMsg (txt) {
  return function (done) {
    logger.debug('[STARTUP] ' + txt)
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
      startupMsg('Started node-ipc servers'),

      notifyReady,
      startupMsg('Notified the frontend that backend is ready')
    ],
    function (err) {
      if (err) logger.error('STARTUP FAILED', err)
      else logger.debug('STARTUP success!')
    }
  )
}

function initDirectories (done) {
  startupMsg('Unpacking Styles')
  // This is necessary to make sure that the directories
  // are writable by the user
  mkdirp.sync(path.join(userDataPath, 'styles'))
  mkdirp.sync(path.join(userDataPath, 'presets'))
  mkdirp.sync(argv.datadir)

  styles.unpackIfNew(userDataPath, function (err, newSettings) {
    if (err) logger.error('Error while unpacking styles:', err)
    var fallbackSettingsLocation = path.join(userDataPath, 'presets', styles.FALLBACK_DIR_NAME)
    if (newSettings) userConfig.copyFallbackSettings(fallbackSettingsLocation, cleanupPermissions)
    else cleanupPermissions()
  })

  function cleanupPermissions () {
    chmod(path.join(userDataPath, 'presets'), '0700', (err) => {
      if (err) logger.error('Failed to execute chmod on presets', err)
      chmod(path.join(userDataPath, 'styles'), '0700', (err) => {
        if (err) logger.error('Failed to execute chmod on styles', err)
        done()
      })
    })
  }
}

function createServers (done) {
  // Set up Electron IPC bridge with frontend in electron-renderer process
  function ipcSend (...args) {
    try {
      if (win && win.webContents) win.webContents.send.apply(win.webContents, args)
    } catch (e) {
      logger.error('exception win.webContents.send', args, e.stack)
    }
  }
  electronIpc(ipcSend)

  // Start Mapeo HTTP Servers
  const opts = {
    userDataPath,
    datadir: argv.datadir,
    port: argv.port,
    tileport: argv.tileport
  }
  logger.info('initializing mapeo', opts)
  main.mapeo.ipc.send('listen', opts, function (err) {
    if (err) throw new Error('mapeo-core listen failed', err)
    const mapPrinterPort = argv.mapPrinterPort
    logger.info('initializing map printer', mapPrinterPort)
    main.mapPrinter.ipc.send('listen', mapPrinterPort, function (err) {
      if (err) logger.error('MAP PRINTER FAILED', err)
      global.osmServerHost = '127.0.0.1:' + opts.port
      global.mapPrinterHost = '127.0.0.1:' + mapPrinterPort
      done()
    })
  })
}

// Wait for in-app window contents to finish loading
// and server to finish starting before closing Loading splash screen
// and showing the window
function notifyReady (done) {
  logger.info('Server ready, checking front-end is loaded')
  // If the window is still loading, wait for it to finish before continuing
  // win.webContents.isLoading() does not seem to work here on Windows
  if (!didFinishLoad) {
    logger.info('Front-end still loading, check again once loaded')
    win.webContents.once('did-finish-load', () => {
      didFinishLoad = true
      notifyReady(done)
    })
    return
  }

  var IS_TEST = process.env.NODE_ENV === 'test'
  if (IS_TEST) win.setSize(1000, 800, false)
  if (argv.debug) win.webContents.openDevTools()
  // notify renderer that server is ready
  // TODO: Send host and port here too, rather than via global
  win.webContents.send('back-end-ready')
  try {
    win.maximize()
    splash.hide()
    win.show()
  } catch (err) {}
  // Start checking for in-app updates
  updater.periodicUpdates()
  done()
}

function createWindow (socketName) {
  if (!socketName) throw new Error('socketName required')
  var APP_NAME = app.getName()
  var INDEX = 'file://' + path.join(__dirname, './static/main.html')
  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })
  var mainWindow = new BrowserWindow({
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
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'src', 'renderer', 'index-preload.js')
    }
  })
  mainWindowState.manage(mainWindow)

  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Front-end has finished loading')
    didFinishLoad = true
    if (process.env.NODE_ENV === 'test') mainWindow.setSize(1000, 800, false)
    if (argv.debug) mainWindow.webContents.openDevTools()
    mainWindow.webContents.send('set-socket', { name: socketName })
    // 'did-finish-load' can fire before the backend server is ready, or when
    // the user refreshes the main window. On window refresh the notifyReady()
    // function will not run, so we use `global.osmServerHost` to check whether
    // the server is ready, and notify the front-end if it is
    if (global.osmServerHost && global.mapPrinterHost) {
      logger.info('Server is ready, inform front-end')
      mainWindow.webContents.send('back-end-ready')
    } else {
      logger.info('Server is not ready, front-end will be informed later')
    }
  })
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (errorDescription === 'ERR_INTERNET_DISCONNECTED' || errorDescription === 'ERR_PROXY_CONNECTION_FAILED') {
      logger.log('Failed to load web contents', errorDescription)
    } else {
      logger.error(errorDescription)
    }
  })
  mainWindow.loadURL(INDEX)
  return mainWindow
}

function createSplashWindow () {
  var SPLASH = 'file://' + path.join(__dirname, './static/splash.html')
  var splash = new BrowserWindow({
    width: 450,
    height: 410,
    center: true,
    transparent: true,
    resizable: false,
    frame: false
  })
  splash.loadURL(SPLASH)
  return splash
}

contextMenu({
  showLookUpSelection: false,
  showCopyImage: true,
  showSaveImageAs: true,
  showInspectElement: isDev
})

function beforeQuit () {
  if (exiting) return
  exiting = true
  // 'close' event will gracefully close databases and wait for pending sync
  logger.debug('Closing IPC')

  let close = null
  setTimeout(() => {
    close = showClosingWindow()
    try { win.close() } catch (e) {}
    try { splash.close() } catch (e) {}
    splash = null
    win = null
  }, 300)
  main.close(() => {
    if (close) close()
    app.exit()
  })
}

// Only enabled in DEV mode.
// Create a hidden background window for Mapeo Core
function createBgWindow (socketName, filename) {
  if (!socketName) throw new Error('socketName required')
  logger.debug('loading mapeo core background window')
  var bgWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: 700,
    height: 700,
    show: argv.debug,
    webPreferences: {
      nodeIntegration: true
    }
  })
  bgWindow.loadURL(filename)
  bgWindow.webContents.on('did-finish-load', () => {
    if (argv.debug) bgWindow.webContents.openDevTools()
    if (bgWindow && bgWindow.webContents) {
      bgWindow.webContents.send('configure', {
        socketName,
        userDataPath,
        isDev
      })
    }
  })
  bgWindow.on('closed', () => {
    logger.info('Background window closed')
    bgWindow = null
    beforeQuit()
  })

  return bgWindow
}

function showClosingWindow () {
  var CLOSING = 'file://' + path.join(__dirname, './static/closing.html')
  var closingWin = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    show: false,
    alwaysOnTop: false
  })

  closingWin.loadURL(CLOSING)
  var closingTimeoutId = setTimeout(() => {
    closingWin.show()
  }, 300)
  return () => {
    clearTimeout(closingTimeoutId)
    try { closingWin.close() } catch (e) {}
    closingWin = null
  }
}
