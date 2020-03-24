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
const logger = require('electron-timber')
const { fork } = require('child_process')

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const middleware = require('./src/middleware')
const miscellaneousIpc = require('./src/main/ipc')
const createMenu = require('./src/main/menu')
const windowStateKeeper = require('./src/main/window-state')

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
var bg = null
var mainWindowState = null
var serverProcess = null
var ipc = new middleware.Client()

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

app.on('before-quit', beforeQuit)
app.on('window-all-closed', function () {
  app.quit()
})

function openWindow () {
  // TODO: get a socket name that isn't open ..
  var _socketName = 'mapeo1'
  logger.log('got socket', _socketName)
  ipc.connect(_socketName)

  if (!win) {
    win = createWindow(_socketName)
    splash = createSplashWindow()
  }

  if (isDev) {
    bg = createBgWindow(_socketName)
    try {
      var {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')
    } catch (e) {}
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => logger.log(`Added Extension:  ${name}`))
      .catch(err => logger.log('An error occurred: ', err))
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
      startupMsg('Started node-ipc servers'),

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
  done()
}

function createServers (done) {
  // TODO: rename/refactor
  miscellaneousIpc(win)

  logger.log('initializing mapeo', userDataPath, argv.port)
  var opts = {
    userDataPath,
    datadir: argv.datadir,
    port: argv.port,
    tileport: argv.tileport
  }

  ipc.send('listen', opts, function (err, port) {
    if (err) throw new Error('fatal: could not get port', err)
    logger.log('listen port got back', port)
    global.osmServerHost = '127.0.0.1:' + port
    logger.log(global.osmServerHost)
    done()
  })
}

function notifyReady (done) {
  win.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      splash.destroy()
      win.show()
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
      preload: path.resolve(__dirname, 'src', 'middleware', 'client-preload.js')
    }
  })
  mainWindowState.manage(win)

  win.loadURL(INDEX)

  win.webContents.on('did-finish-load', () => {
    if (process.env.NODE_ENV === 'test') win.setSize(1000, 800, false)
    if (argv.debug) win.webContents.openDevTools()
    win.webContents.send('set-socket', {
      name: socketName
    })
  })
  return win
}

// Create a hidden background window
function createBgWindow (socketName) {
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
  console.log('loading bg window')
  var BG = 'file://' + path.join(__dirname, '/background.html')
  win.loadURL(BG)
  win.webContents.on('did-finish-load', () => {
    if (argv.debug) bg.webContents.openDevTools()
    win.webContents.send('set-socket', {
      name: socketName
    })
  })
  win.on('closed', () => {
    console.log('background window closed')
    app.quit()
  })
  return win
}

function createSplashWindow () {
  var SPLASH = 'file://' + path.join(__dirname, './splash.html')
  var splash = new BrowserWindow({
    width: 810,
    height: 610,
    transparent: true,
    show: true,
    frame: false,
    alwaysOnTop: true
  })
  splash.loadURL(SPLASH)
  return splash
}

function createBackgroundProcess (socketName) {
  console.log('creating background process')
  serverProcess = fork(path.join(__dirname, 'src', 'middleware', 'background.js'), [
    '--subprocess',
    app.getVersion(),
    socketName
  ])

  serverProcess.on('message', msg => {
    console.log(msg)
  })
}

contextMenu({
  showLookUpSelection: false,
  showCopyImage: true,
  showSaveImageAs: true,
  showInspectElement: isDev
})

function beforeQuit (e) {
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

  // 'close' event will gracefully close databases and wait for pending sync
  // TODO: Show the user that a sync is pending finishing
  console.log('ipc.send close')
  ipc.send('close', null, () => {
    console.log('closed')
    clearTimeout(closingTimeoutId)
    if (serverProcess) serverProcess.kill()
    try { closingWin.close() } catch (e) {}
    closingWin = null
    serverProcess = null
    app.exit()
  })
}

// function handleError (error) {
//   logger.error('uncaughtException in Node:', error)
//   if (app && win) win.webContents.send('error', error.stack)
// }
