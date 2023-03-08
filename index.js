#!/usr/bin/env electron

const path = require('path')
const minimist = require('minimist')
const { app } = require('electron')
const debug = require('electron-debug')
const isDev = require('electron-is-dev')

const logger = require('./src/logger')
const startApp = require('./src/main')
const cleanUpOrphanProcesses = require('./src/main/pid-cleanup')
const getPorts = require('./src/utils/get-ports')

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
    mapsdir: path.join(userDataPath, 'background-maps'),
    tileport: 5005,
    mapPrinterPort: 5200,
    mapServerPort: 5300
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

// Configure the logger before we do anything
if (!logger.configured) {
  logger.configure({
    label: 'main',
    userDataPath,
    isDev
  })
}

// Ensure only one instance can be open at a time
var gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  logger.debug('Another instance of Mapeo is already open, exiting.')
  // Didn't get a lock, because another instance is open, so we quit
  process.exit(0)
}

;(async () => {
  // Cleanup any orphaned processes that might be left from the app not closing
  // gracefully last time it loaded. Do this before trying to find available
  // port (since orphaned process could be occupying port)
  await cleanUpOrphanProcesses()

  // Wait for Electron to finish initializing
  await app.whenReady()

  if (isDev) {
    // for updater to work correctly
    process.env.APPIMAGE = path.join(
      __dirname,
      'dist',
      `Install_Mapeo_v${app.getVersion()}_linux.AppImage`
    )
    try {
      // DevTools do not load in Electron v9 see
      // https://github.com/electron/electron/issues/24011
      var {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')
      const name = await installExtension(REACT_DEVELOPER_TOOLS)
      logger.debug(`Added Extension:  ${name}`)
    } catch (err) {
      logger.error('Failed to add extension', err)
    }
  }

  try {
    // Ensure we have open ports. Small chance the ports could get taken by
    // another app before we finish loading, but hopefully unlikely!
    const [
      mapeoServerPort,
      tileServerPort,
      mapPrinterPort,
      mapServerPort
    ] = await getPorts([
      argv.port,
      argv.tileport,
      argv.mapPrinterPort,
      argv.mapServerPort
    ])
    const { headless, debug, datadir, mapsdir } = argv
    logger.timedPromise(
      startApp({
        mapeoServerPort,
        tileServerPort,
        mapPrinterPort,
        mapServerPort,
        headless,
        debug,
        datadir,
        mapsdir
      }),
      'Started Mapeo'
    )
  } catch (err) {
    logger.error('Failed to start Mapeo', err)
  }
})()
