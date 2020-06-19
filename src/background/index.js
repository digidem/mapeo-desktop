const rabbit = require('electron-rabbit')
const serverHandlers = require('./mapeo-ipc')

const Worker = require('../worker')

if (process.argv[2] === '--subprocess') {
  const logger = require('../logger')
  const socketName = process.argv[3]
  const userDataPath = process.argv[4]
  if (!logger.configured) {
    logger.configure({
      label: 'background',
      userDataPath
    })
  }

  var worker = new Worker(userDataPath)
  worker.pid((err) => {
    if (err) logger.error('Error writing PID file', err)
    logger.debug('PID file written successfully.')
  })

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
