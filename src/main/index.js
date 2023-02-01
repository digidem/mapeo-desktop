// @ts-check

const path = require('path')
const { app, dialog, MessageChannelMain, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const mkdirp = require('mkdirp')
const Database = require('better-sqlite3')
const createMapServer = require('@mapeo/map-server')

const onExit = require('./exit-hook')
const BackgroundProcessManager = require('./background-process')
const createMenu = require('./menu')
const updater = require('./auto-updater')
const logger = require('../logger')
const electronIpc = require('./ipc')
const ClientIpc = require('../client-ipc')
const { MainWindow, LoadingWindow, ClosingWindow } = require('./windows')
const { once } = require('events')
const buildConfig = require('../build-config')

/** @typedef {import('../utils/types').MapeoCoreOptions} MapeoCoreOptions */
/** @typedef {import('electron').BrowserWindow} BrowserWindow */

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

module.exports = startup

/**
 * Start the Mapeo app
 *
 * @param {object} options
 * @param {number} options.mapeoServerPort
 * @param {number} options.tileServerPort
 * @param {number} options.mapPrinterPort
 * @param {number} options.mapServerPort
 * @param {string} options.datadir Path to dir for all Mapeo data
 * @param {string} options.mapsdir Path to dir for storing background maps database
 * @param {boolean} [options.debug]
 * @param {boolean} [options.headless]
 */
async function startup ({
  mapeoServerPort,
  tileServerPort,
  mapPrinterPort,
  mapServerPort,
  mapsdir,
  debug = false,
  headless = false,
  datadir
}) {
  // Before we do anything, let's make sure we're ready to gracefully shut down
  onExit(beforeQuit)

  /** @type {'loading' | 'ready' | 'exiting'} */
  let status = 'loading'

  // Configure context menu
  contextMenu({
    showLookUpSelection: false,
    showCopyImage: true,
    showSaveImageAs: true,
    showInspectElement: isDev
  })

  // Set up Electron IPC bridge with frontend in electron-renderer process
  electronIpc(ipcSend)

  // Window Management
  /** @type {BrowserWindow | null} */
  let winMain = MainWindow({
    mapeoServerPort,
    tileServerPort,
    mapPrinterPort,
    mapServerPort
  })
  if (debug) winMain.webContents.openDevTools()
  /** @type {BrowserWindow | null} */
  let winLoading = LoadingWindow()
  /** @type {BrowserWindow | null} */
  let winClosing = ClosingWindow()

  winMain.on('close', () => beforeQuit())

  /** @type {import('../utils/types').MapeoCoreOptions} */
  const mapeoCoreArgs = {
    datadir,
    mapeoServerPort,
    tileServerPort,
    userDataPath
  }
  /** @type {import('../utils/types').MapPrinterOptions} */
  const mapPrinterArgs = {
    mapPrinterPort
  }

  // Background processes
  const backgroundProcesses = new BackgroundProcessManager()
  backgroundProcesses.createProcess(
    path.join(__dirname, '../background/mapeo-core'),
    { id: 'mapeoCore', args: mapeoCoreArgs, devTools: debug }
  )
  backgroundProcesses.createProcess(
    path.join(__dirname, '../background/map-printer'),
    { id: 'mapPrinter', args: mapPrinterArgs, devTools: debug }
  )

  // Running this in the main thread rather than in a background process because
  // map-server uses Node Worker Threads, and the background processes actually
  // run in a browser window (with Node integration turned on) but they do not
  // support Node workers (only Web Workers). The reason for running the other
  // processes (map printer and mapeo core) in a background process was because
  // processes in the main thread are blocking for the render thread.
  // Fortunately map server does not have any expensive functions so it should
  // not slow down the main process nor block the render thread if we run it
  // here from the main process...
  const mapServer = createMapServer(undefined, {
    database: new Database(path.join(mapsdir, 'maps.db'))
  })

  // Subscribe the main window to background process state changes
  const unsubscribeMainWindow = backgroundProcesses.subscribeWindow(winMain)

  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    logger.debug('Second instance of app detected, bringing focus to here')
    const win =
      status === 'loading'
        ? winLoading
        : status === 'ready'
        ? winMain
        : winClosing
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  ipcMain.on('mapeo-client', event => {
    // This is called first time the main window loads, and whenever it reloads
    logger.debug('Adding new client to Mapeo Core')
    const port = event.ports[0]
    backgroundProcesses.addClient('mapeoCore', port)
    // TODO: Remove client when window reloads? Is this a significant leak?
  })

  try {
    // Show loading window straight away
    // TODO: Start other tasks in parallel to this await, but is it worth it?
    await logger.timedPromise(
      winLoading.loadFile(LoadingWindow.filePath),
      'Loaded loading window'
    )
    winLoading.show()

    // Set up a message channel & IPC for communicating between the main process
    // and Mapeo Core, and create the app menu with this IPC channel Once Mapeo
    // Core is loaded, need to pass it port2 - messages will be queued until a
    // listener is attached to port2
    // TODO: Work with raw MessagePort not ClientIpc wrapper
    const { port1, port2 } = new MessageChannelMain()
    const ipc = new ClientIpc({ port: port1 })
    createMenu(ipc)
    backgroundProcesses.addClient('mapeoCore', port2)

    await logger.timedPromise(
      Promise.all([
        // Create folders for data, custom presets, and custom styles
        mkdirp(datadir),
        mkdirp(mapsdir),
        mkdirp(path.join(userDataPath, 'presets')),
        mkdirp(path.join(userDataPath, 'styles')),
        // Startup background processes and servers
        logger.timedPromise(
          backgroundProcesses.startAll(),
          'Started background processes'
        ),
        logger.timedPromise(
          mapServer.listen(mapServerPort, '127.0.0.1'),
          'Started Mapeo Map Server'
        ),
        // Load main window and show it when it has loaded
        logger.timedPromise(loadMainWindow(), 'First render in main window')
      ]),
      'Frontend & backend ready'
    )

    if (debug) winMain.webContents.openDevTools()
    winLoading.hide()
    status = 'ready'

    // Load closing window, so it's ready when we need it
    winClosing.loadFile(ClosingWindow.filePath)

    // Start checking for in-app updates only for main variant
    // TODO: Support auto-updates for other variants
    if (buildConfig.variant === 'main') {
      updater.periodicUpdates()
    }
  } catch (err) {
    onError(err)
  }

  // Load main window but wait for first render before showing
  async function loadMainWindow () {
    winMain &&
      (await logger.timedPromise(
        winMain.loadFile(MainWindow.filePath),
        'Main window load'
      ))
    await once(ipcMain, 'frontend-rendered')
    winMain && winMain.show()
  }

  /**
   * Attempt to send an electron IPC message to the main window, return false if
   * unable to send, used to show error messages in a dialog if the main window
   * is not available.
   *
   * @param {any[]} args
   * @returns {boolean} true if could send IPC to main window
   */
  function ipcSend (...args) {
    try {
      if (winMain && winMain.webContents) {
        winMain.webContents.send.apply(winMain.webContents, args)

        if (
          winClosing &&
          winClosing.webContents &&
          args[0].startsWith('CLOSING:')
        ) {
          winClosing.webContents.send.apply(winClosing.webContents, args)
        }

        return true
      } else return false
    } catch (e) {
      logger.error(
        'exception win.webContents.send ' + JSON.stringify(args),
        e.stack
      )
      return false
    }
  }

  /**
   * Try to send the error to the render process, to show a friendly error to
   * the user, but if the main window is not open, then we need to resort to the
   * ugly Electron dialog for showing the error
   *
   * @param {Error} err
   */
  function onError (err) {
    if (!ipcSend('error', err.toString())) {
      dialog.showErrorBox('Error', err.toString())
    }
  }

  async function beforeQuit () {
    if (status === 'exiting') return
    status = 'exiting'
    logger.debug('Exiting app')

    // Close main window straight away
    unsubscribeMainWindow()
    winMain && winMain.close()
    winLoading && winLoading.close()

    // If closing is taking longer, show closing window
    const timeoutId = setTimeout(() => {
      winClosing && winClosing.show()
    }, 300)

    // Close background processes
    await logger.timedPromise(
      backgroundProcesses.stopAll(),
      'Stopped background processes'
    )
    await logger.timedPromise(mapServer.close(), 'Stopped Mapeo Map Server')
    clearTimeout(timeoutId)

    winClosing && winClosing.close()
    // De-reference all windows to allow garbage collection
    winClosing = null
    winMain = null
    winLoading = null

    app.exit()
  }
}
