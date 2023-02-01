// @ts-check

const remote = require('@electron/remote/main')
const { app, BrowserWindow } = require('electron')
const path = require('path')

const windowStateKeeper = require('./window-state')
const logger = require('../logger')

module.exports = {
  MainWindow,
  LoadingWindow,
  ClosingWindow
}

MainWindow.filePath = path.join(__dirname, '../../static/main.html')

/**
 * @param {object} options
 * @param {number} options.mapeoServerPort
 * @param {number} options.tileServerPort
 * @param {number} options.mapPrinterPort
 * @param {number} options.mapServerPort
 * @returns {BrowserWindow}
 */
function MainWindow (options) {
  var APP_NAME = app.getName()
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })
  var mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: process.env.NODE_ENV === 'test' ? 1000 : mainWindowState.width,
    height: process.env.NODE_ENV === 'test' ? 800 : mainWindowState.height,
    title: APP_NAME,
    show: false,
    alwaysOnTop: false,
    titleBarStyle: 'hidden',
    icon: path.resolve(__dirname, '../../static/mapeo_256x256.png'),
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      preload: path.resolve(__dirname, '../renderer/index-preload.js'),
      additionalArguments: [JSON.stringify(options)],
      contextIsolation: false
    }
  })
  mainWindowState.manage(mainWindow)

  mainWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription) => {
      if (
        errorDescription === 'ERR_INTERNET_DISCONNECTED' ||
        errorDescription === 'ERR_PROXY_CONNECTION_FAILED'
      ) {
        logger.warn('Failed to load web contents', errorDescription)
      } else {
        logger.error(errorDescription)
      }
    }
  )

  remote.enable(mainWindow.webContents)

  return mainWindow
}

LoadingWindow.filePath = path.join(__dirname, '../../static/splash.html')

function LoadingWindow () {
  return new BrowserWindow({
    width: 450,
    height: 410,
    center: true,
    show: false,
    transparent: true,
    resizable: false,
    frame: false
  })
}

ClosingWindow.filePath = path.join(__dirname, '../../static/closing.html')

function ClosingWindow () {
  return new BrowserWindow({
    width: 600,
    height: 400,
    center: true,
    frame: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '../../static/closingPreload.js')
    }
  })
}
