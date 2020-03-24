const serverHandlers = require('../main/mapeo-ipc')
const hoist = require('hoist')

if (process.argv[2] === '--subprocess') {
  const socketName = process.argv[4]
  hoist.init(socketName, serverHandlers)
} else {
  const { ipcRenderer } = require('electron')
  ipcRenderer.on('set-socket', (event, { name }) => {
    hoist.init(name, serverHandlers)
  })
}
