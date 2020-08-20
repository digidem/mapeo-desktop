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
const rabbit = require('electron-rabbit')
const chmod = require('chela').mod

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const updater = require('./src/main/auto-updater')
const userConfig = require('./src/main/user-config')
const Worker = require('./src/worker')
const logger = require('./src/logger')
const electronIpc = require('./src/main/ipc')
const createMenu = require('./src/main/menu')
const windowStateKeeper = require('./src/main/window-state')

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')
var worker = new Worker(userDataPath)

// HACK: enable GPU graphics acceleration on some older laptops
app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
app.commandLine.appendSwitch('ignore-certificate-errors')

// Setup some handy dev tools shortcuts (only activates in dev mode)
// See https://github.com/sindresorhus/electron-debug
debug({ showDevTools: false })

// Handle uncaught errors
// XXX(KM): why aren't we enabling this?
// catchErrors({ onError: handleError })
//
var exiting = false

// Before we do anything, let's make sure we're ready to gracefully shut down
const onExit = require('capture-exit')
const signalExit = require('signal-exit')
onExit.captureExit()
onExit.onExit(beforeQuit)
signalExit(beforeQuit, { alwaysLast: true })

var win = null
var splash = null
var bg = null
var mainWindowState = null
var ipc = new rabbit.Client()

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

if (!logger.configured) {
  logger.configure({
    label: 'main',
    userDataPath,
    isDev
  })
}

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

var _socketName

rabbit.findOpenSocket('mapeo').then((socketName) => {
  logger.debug('got socket', socketName)
  _socketName = socketName
  if (argv.headless) startSequence()
  else app.once('ready', openWindow)
}).catch((err) => {
  logger.error(err)
  throw new Error('No socket found!', err)
})

app.on('before-quit', (e) => {
  // Cancel quit and wait for server to close
  if (e) e.preventDefault()
  beforeQuit()
})
app.on('window-all-closed', function () {
  app.quit()
})

function openWindow () {
  ipc.on('error', function (err) {
    logger.error('ipc', err)
    electron.dialog.showErrorBox('Error', err)
  })
  ipc.connect(_socketName)

  if (!win) {
    win = createWindow(_socketName)
    splash = createSplashWindow()
  }

  if (isDev) {
    // for updater to work correctly
    process.env.APPIMAGE = path.join(__dirname, 'dist', `Installar_Mapeo_v${app.getVersion()}_linux.AppImage`)
    bg = createBgWindow(_socketName)
    try {
      var {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')
    } catch (e) {}
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => logger.debug(`Added Extension:  ${name}`))
      .catch(err => logger.error('Failed to add extension', err))
  } else {
    createBackgroundProcess(_socketName)
  }
  createMenu(ipc)

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    splash = null
    bg = null
    app.quit()
  })

  startSequence()
}

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
  // This is necessary to make sure that the styles and presets directory
  // are writable by the user
  mkdirp.sync(path.join(userDataPath, 'styles'))
  mkdirp.sync(path.join(userDataPath, 'presets'))
  mkdirp.sync(argv.datadir)

  styles.unpackIfNew(userDataPath, function (err, newSettings) {
    if (err) logger.error('[ERROR] while unpacking styles:', err)
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
  function ipcSend (...args) {
    try {
      if (win && win.webContents) win.webContents.send.apply(win.webContents, args)
    } catch (e) {
      logger.error('exception win.webContents.send', args, e.stack)
    }
  }

  electronIpc(ipcSend)

  logger.info('initializing mapeo', userDataPath, argv.port)
  var opts = {
    userDataPath,
    datadir: argv.datadir,
    port: argv.port,
    tileport: argv.tileport
  }

  ipc.send('listen', opts, function (err, port) {
    if (err) throw new Error('fatal: could not get port', err)
    global.osmServerHost = '127.0.0.1:' + port
    logger.info(global.osmServerHost)
    done()
  })
}

function notifyReady (done) {
  win.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      var IS_TEST = process.env.NODE_ENV === 'test'
      if (IS_TEST) win.setSize(1000, 800, false)
      if (argv.debug) win.webContents.openDevTools()

      win.maximize()
      splash.destroy()
      win.show()
      updater.periodicUpdates()
      done()
    }, 1000)
  })
}

function createWindow (socketName) {
  var APP_NAME = app.getName()
  var INDEX = 'file://' + path.join(__dirname, './index.html')
  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })
  var win = new BrowserWindow({
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
  mainWindowState.manage(win)

  win.webContents.on('did-finish-load', () => {
    if (process.env.NODE_ENV === 'test') win.setSize(1000, 800, false)
    if (argv.debug) win.webContents.openDevTools()
    win.webContents.send('set-socket', {
      name: socketName
    })
  })
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (errorDescription === 'ERR_INTERNET_DISCONNECTED' || errorDescription === 'ERR_PROXY_CONNECTION_FAILED') {
      logger.log(errorDescription)
    }
    logger.error(errorDescription)
  })
  win.loadURL(INDEX)
  return win
}

// Create a hidden background window
function createBgWindow (socketName) {
  logger.debug('loading electron background window')
  var win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 700,
    height: 700,
    show: argv.debug,
    webPreferences: {
      nodeIntegration: true
    }
  })
  var BG = 'file://' + path.join(__dirname, './src/background/index.html')
  win.loadURL(BG)
  win.webContents.on('did-finish-load', () => {
    if (argv.debug) bg.webContents.openDevTools()
    if (win && win.webContents) {
      win.webContents.send('configure', {
        socketName,
        userDataPath,
        isDev
      })
    }
  })
  win.on('closed', () => {
    logger.info('Background window closed')
    app.quit()
  })
  return win
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

function createBackgroundProcess (socketName) {
  worker.start(socketName, (err) => {
    if (err) logger.error('Failed to start worker', err)
  })
}

contextMenu({
  showLookUpSelection: false,
  showCopyImage: true,
  showSaveImageAs: true,
  showInspectElement: isDev
})

function showClosingWindow () {
  var CLOSING = 'file://' + path.join(__dirname, './closing.html')
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

function beforeQuit () {
  if (exiting) return
  exiting = true
  // 'close' event will gracefully close databases and wait for pending sync
  logger.debug('Closing IPC')

  ipc.send('get-replicating-peers', null, (err, length) => {
    if (err) logger.error('get-replicating-peers on close', err)

    let closeClosingWindow = () => {}
    if (length) closeClosingWindow = showClosingWindow()

    ipc.send('close', null, () => {
      logger.debug('IPC closed')

      worker.cleanup((err) => {
        if (err) !isDev ? logger.error('Failed to clean up a child process', err) : logger.debug('Nothing to clean up')
        logger.debug('Successfully removed any stale processes')

        closeClosingWindow()
        app.exit()
      })
    })
  })
}
