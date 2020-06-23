const rabbit = require('electron-rabbit')
const serverHandlers = require('./mapeo-ipc')

if (process.argv[2] === '--subprocess') {
  const logger = require('../logger')
  const socketName = process.argv[4]
  const userDataPath = process.argv[5]
  if (!logger.configured) {
    logger.configure({
      label: 'background',
      userDataPath
    })
  }
  rabbit.init(socketName, serverHandlers)
} else {
  const electron = require('electron')
  const logger = require('../logger')

  electron.ipcRenderer.on('configure', (event, {
    socketName, isDev, userDataPath
  }) => {
    if (!logger.configured) {
      logger.configure({
        label: 'electron-background',
        userDataPath,
        isDev
      })
    }
    rabbit.init(socketName, serverHandlers)
  })
}
