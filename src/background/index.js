const rabbit = require('electron-rabbit')
const NodePIDManager = require('../pid-manager')

function startNodeIPC (serverHandlers) {
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

    var manager = new NodePIDManager(userDataPath)
    manager.pid((err) => {
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
      logger.info('configured', socketName)
      if (!logger.configured) {
        logger.configure({
          label: 'background',
          userDataPath,
          isDev
        })
      }
      rabbit.init(socketName, serverHandlers)
    })
  }
}

module.exports = startNodeIPC
