const rabbit = require('electron-rabbit')
const path = require('path')
const events = require('events')

const logger = require('../logger')
const NodePIDmanager = require('../pid-manager')

class Socket {
  constructor (socketName) {
    this.name = socketName
    this.ipc = new rabbit.Client()
  }

  findSocket (cb) {
    rabbit.findOpenSocket(this.name).then((socketName) => {
      this.name = socketName
      cb(socketName)
    }).catch((err) => {
      logger.error(err)
      throw new Error('No socket found!', err)
    })
  }

  connectToOpenSocket (cb) {
    this.findSocket(() => {
      this.ipc.connect(this.name)
      cb()
    })
  }
}

class Main extends events.EventEmitter {
  constructor ({
    userDataPath,
    isDev
  }) {
    super()
    this.isDev = isDev
    this.pid = new NodePIDmanager(userDataPath)

    this.mapeo = new Socket('mapeo')
    this.mapPrinter = new Socket('mapPrinter')
    this.pid.on('close', (err) => {
      if (err) this.emit('error', err)
    })
  }

  ready () {
    return new Promise((resolve, reject) => {
      logger.info('waiting')
      this.pid.cleanup((err) => {
        if (err) logger.debug('No stale processes to clean up')
        else logger.debug('Successfully removed any stale processes')
        var pending = 2
        this.mapeo.connectToOpenSocket(() => {
          if (--pending === 0) _ready()
        })
        this.mapPrinter.connectToOpenSocket(() => {
          if (--pending === 0) _ready()
        })
      })

      var _ready = () => {
        logger.info('resolve')
        this.emit('ready')
        resolve()
      }
    })
  }

  startMapeoNodeIPC () {
    this.pid.create({
      socketName: this.mapeo.name,
      filepath: path.join(__dirname, '..', 'background', 'mapeo-core', 'index.js')
    }, (err, process) => {
      if (err) logger.error('Failed to start Mapeo Core', err)
    })
  }

  close (cb) {
    var _close = () => {
      this.pid.cleanup((err) => {
        if (err) {
          this.isDev
            ? logger.debug('Nothing to clean up')
            : logger.error('Failed to clean up a child process', err)
        }
        logger.debug('Successfully removed any stale processes')
        cb()
      })
    }

    logger.info('process?', !!this.pid.process)
    if (!this.pid.process) return _close()

    this.mapeo.ipc.send('get-replicating-peers', null, (err, peers) => {
      if (err) logger.error(err)
      logger.info(peers, 'peers still replicating upon close')
      // If there are peers still replicating, give Mapeo
      // 5 minutes to complete replication.
      // If no peers are replicating, give Mapeo core 3 seconds before
      // sending the kill signal
      var timeout = setTimeout(() => {
        _close()
      }, peers > 0 ? 1000 * 60 * 5 : 7000)
      this.mapeo.ipc.send('close', null, () => {
        logger.debug('IPC closed')
        clearTimeout(timeout)
        _close()
      })
    })
  }
}

module.exports = Main
