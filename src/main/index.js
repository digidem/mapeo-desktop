// @ts-check

const path = require('path')
const { app, dialog, MessageChannelMain, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const { promisify } = require('util')
const mkdirp = require('mkdirp')
const styles = require('mapeo-styles')
const unpackStylesIfNew = promisify(styles.unpackIfNew)
const chmod = promisify(require('chela').mod)

const onExit = require('./exit-hook')
const BackgroundProcess = require('./background-process')
const createMenu = require('./menu')
const updater = require('./auto-updater')
const userConfig = require('./user-config')
const logger = require('../logger')
const electronIpc = require('./ipc')
const ClientIpc = require('../client-ipc')
const { MainWindow, LoadingWindow, ClosingWindow } = require('./windows')

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
 * @param {string} options.datadir Path to dir for all Mapeo data
 * @param {boolean} [options.debug]
 * @param {boolean} [options.headless]
 */
async function startup ({
  mapeoServerPort,
  tileServerPort,
  mapPrinterPort,
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
  let winMain = MainWindow({ mapeoServerPort, tileServerPort, mapPrinterPort })
  if (debug) winMain.webContents.openDevTools()
  /** @type {BrowserWindow | null} */
  let winLoading = LoadingWindow()
  /** @type {BrowserWindow | null} */
  let winClosing = ClosingWindow()

  winMain.on('close', () => beforeQuit())

  // Background processes
  const mapeoCore = new BackgroundProcess(
    path.join(__dirname, '../background/mapeo-core')
  )
  const mapPrinter = new BackgroundProcess(
    path.join(__dirname, '../background/map-printer')
  )

  mapeoCore.on('error', onError)
  mapPrinter.on('error', onError)

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
    mapeoCore.addClient(port)
  })

  try {
    // Show loading window straight away
    // TODO: Start other tasks in parallel to this await, but is it worth it?
    await winLoading.loadFile(LoadingWindow.filePath)
    winLoading.show()
    logger.debug('[STARTUP] Opened loading window')

    /** @type {import('../utils/types').MapeoCoreOptions} */
    const mapeoCoreOptions = {
      datadir,
      mapeoServerPort,
      tileServerPort,
      userDataPath
    }
    /** @type {import('../utils/types').MapPrinterOptions} */
    const mapPrinterOptions = {
      mapPrinterPort
    }

    // Initialize directories for Mapeo data
    await initDirectories({
      datadir,
      presetsDir: path.join(userDataPath, 'presets'),
      stylesDir: path.join(userDataPath, 'styles')
    })

    // Startup background processes and servers
    await Promise.all([
      mapeoCore.start(mapeoCoreOptions, { devTools: debug }),
      mapPrinter.start(mapPrinterOptions, { devTools: debug })
    ])
    logger.debug('[STARTUP] Started background processes')

    // Set up a message channel & IPC for communicating between the main process
    // and Mapeo Core, and create the app menu with this IPC channel Once Mapeo
    // Core is loaded, need to pass it port2 - messages will be queued until a
    // listener is attached to port2
    // TODO: Work with raw MessagePort not ClientIpc wrapper
    const { port1, port2 } = new MessageChannelMain()
    const ipc = new ClientIpc({ port: port1 })
    createMenu(ipc)
    mapeoCore.addClient(port2)

    // Load main window and show it when it has loaded
    // TODO: Don't show until UI is displayed
    // TODO: Start loading main window in parallel to background process startup
    await winMain.loadFile(MainWindow.filePath)
    winMain.show()
    if (debug) winMain.webContents.openDevTools()
    winLoading.hide()
    status = 'ready'
    logger.debug('[STARTUP] Loaded main window, now ready')

    // Load closing window, so it's ready when we need it
    winClosing.loadFile(ClosingWindow.filePath)

    // Start checking for in-app updates
    updater.periodicUpdates()
  } catch (err) {
    onError(err)
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
    logger.debug('Closing background processes')

    // Close main window straight away
    winMain && winMain.close()
    winLoading && winLoading.close()

    // If closing is taking longer, show closing window
    setTimeout(() => {
      winClosing && winClosing.show()
    }, 300)

    // Close background processes
    await Promise.all([mapeoCore.close(), mapPrinter.close()])

    logger.debug('Background processes closed, now quitting app')

    winClosing && winClosing.close()
    // De-reference all windows to allow garbage collection
    winClosing = null
    winMain = null
    winLoading = null

    app.exit()
  }
}

/**
 * Create directories for presets and styles and unpack default settings
 *
 * @param {object} options
 * @param {string} options.stylesDir
 * @param {string} options.presetsDir
 * @param {string} options.datadir
 * @returns {Promise<void>}
 */
async function initDirectories ({ stylesDir, presetsDir, datadir }) {
  logger.debug('[STARTUP] Unpacking Styles')

  await Promise.all([mkdirp(stylesDir), mkdirp(presetsDir), mkdirp(datadir)])

  try {
    const newSettings = await unpackStylesIfNew(userDataPath)
    const fallbackSettingsLocation = path.join(
      presetsDir,
      styles.FALLBACK_DIR_NAME
    )
    if (newSettings) {
      await userConfig.copyFallbackSettings(fallbackSettingsLocation)
    }
  } catch (err) {
    logger.error('Error while unpacking styles:', err)
  }

  try {
    // This is necessary to make sure that the directories are user-writable
    await Promise.all([chmod(presetsDir, '0700'), chmod(stylesDir, '0700')])
  } catch (err) {
    logger.error('Failed to execute chmod on styles & presets', err)
  }
}
