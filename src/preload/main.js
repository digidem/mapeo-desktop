const { ipcRenderer, shell, nativeImage } = require('electron')
const IPC = require('../client-ipc')
const logger = require('../logger')

/** @typedef {import('../utils/types').BackgroundProcess} BackgroundProcess */
/** @typedef {import('../utils/types').IpcResponse} IpcResponse */

const [portsJSON, userDataPath, mode] = process.argv.slice(-3)

const {
  mapeoServerPort,
  tileServerPort,
  mapPrinterPort,
  mapServerPort
} = JSON.parse(portsJSON)

// The logger instance in preload is different from that in the main window
// So we also need to configure it here
logger.configure({
  userDataPath,
  label: 'renderer-preload',
  isDev: mode === 'development'
})

const { port1, port2 } = new MessageChannel()

ipcRenderer.postMessage('mapeo-client', null, [port1])

window.middlewareClient = new IPC({ port: port2 })

// TODO: Used by renderer processes to determine if in development mode or not. There's probably a better way to do this
window.mode = mode
window.mapeoServerPort = mapeoServerPort
window.tileServerPort = tileServerPort
window.mapPrinterPort = mapPrinterPort
window.mapServerPort = mapServerPort

// Methods used by the renderer app
// https://github.com/electron/electron/issues/9920#issuecomment-468323625
window.electron = {
  ipcRenderer,
  shell,
  nativeImage
}

if (mode === 'development') {
  // https://esbuild.github.io/api/#live-reload
  // TODO: Should remove client in Mapeo Core before reloading
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload()
  )
}
