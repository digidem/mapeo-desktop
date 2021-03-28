const { ipcRenderer } = require('electron')
const IPC = require('../client-ipc')

const { port1, port2 } = new MessageChannel()

ipcRenderer.postMessage('mapeo-client', null, [port1])

window.middlewareClient = new IPC({ port: port2 })

const { mapeoServerPort, tileServerPort, mapPrinterPort } = JSON.parse(
  process.argv[process.argv.length - 1]
)

window.mapeoServerPort = mapeoServerPort
window.tileServerPort = tileServerPort
window.mapPrinterPort = mapPrinterPort
