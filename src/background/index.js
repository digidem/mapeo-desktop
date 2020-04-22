const serverHandlers = require('./mapeo-ipc')
const rabbit = require('electron-rabbit')

if (process.argv[2] === '--subprocess') {
  const socketName = process.argv[4]
  rabbit.init(socketName, serverHandlers)
} else {
  const { ipcRenderer } = require('electron')
  ipcRenderer.on('set-socket', (event, { name }) => {
    rabbit.init(name, serverHandlers)
  })
}
