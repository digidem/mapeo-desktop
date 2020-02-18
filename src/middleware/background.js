const serverHandlers = require('../main/mapeo-ipc')
const ipc = require('./background-ipc')

let isDev, version

if (process.argv[2] === '--subprocess') {
  isDev = false
  version = process.argv[3]

  const socketName = process.argv[4]
  console.log('initing', socketName)
  ipc.init(socketName, serverHandlers)
} else {
  const { ipcRenderer, remote } = require('electron')
  isDev = true
  version = remote.app.getVersion()
  console.log('electron', version)

  ipcRenderer.on('set-socket', (event, { name }) => {
    console.log('initing', name)
    ipc.init(name, serverHandlers)
  })
}

console.log(version, isDev)
