const remote = require('@electron/remote')
const { ipcRenderer } = require('electron')
const IPC = require('../client-ipc')
const logger = require('../logger')

/** @typedef {import('../utils/types').BackgroundProcess} BackgroundProcess */
/** @typedef {import('../utils/types').IpcResponse} IpcResponse */

const userDataPath = remote.app.getPath('userData')
// The logger instance in preload is different from that in the main window
// So we also need to configure it here
logger.configure({ userDataPath, label: 'renderer-preload' })

const { port1, port2 } = new MessageChannel()

ipcRenderer.postMessage('mapeo-client', null, [port1])

window.middlewareClient = new IPC({ port: port2 })

const {
  mapeoServerPort,
  tileServerPort,
  mapPrinterPort,
  mapServerPort
} = JSON.parse(process.argv[process.argv.length - 1])

window.mapeoServerPort = mapeoServerPort
window.tileServerPort = tileServerPort
window.mapPrinterPort = mapPrinterPort
window.mapServerPort = mapServerPort
