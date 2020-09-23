const rabbit = require('electron-rabbit')
const path = require('path')
const events = require('events')

const logger = require('../logger')
const NodePIDmanager = require('../pid-manager')

class Main extends events.EventEmitter {
  constructor ({
    userDataPath,
    isDev
  }) {
    super()
    this.ready = false
    this.isDev = isDev
    this.pid = new NodePIDmanager(userDataPath)

    this.mapeo = new rabbit.Client()
    this.mapPrinter = new rabbit.Client()
    this.pid.on('close', (err) => {
      if (err) this.emit('error', err)
    })

    this.pid.cleanup((err) => {
      if (err) logger.debug('No stale processes to clean up')
      else logger.debug('Successfully removed any stale processes')
      this._findSocket('mapeo', (socket) => {
        this.mapeoSocket = socket
        if (this.mapPrinterSocket) this._ready()
      })
      this._findSocket('mapPrinter', (socket) => {
        this.mapPrinterSocket = socket
        if (this.mapeoSocket) this._ready()
      })
    })
  }

  _ready () {
    if (this.ready) return
    this.ready = true
    logger.info('main ready')
    this.mapPrinter.connect(this.mapPrinterSocket)
    this.mapeo.connect(this.mapeoSocket)
    this.emit('ready')
  }

  _findSocket (name, cb) {
    rabbit.findOpenSocket(name).then((socketName) => {
      cb(socketName)
    }).catch((err) => {
      logger.error(err)
      throw new Error('No socket found!', err)
    })
  }

  startMapeoNodeIPC () {
    this.pid.create({
      socketName: this.mapeoSocket,
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

    this.mapeo.send('get-replicating-peers', null, (err, peers) => {
      if (err) logger.error(err)
      logger.info(peers, 'peers still replicating upon close')
      // If there are peers still replicating, give Mapeo
      // 5 minutes to complete replication.
      // If no peers are replicating, give Mapeo core 3 seconds before
      // sending the kill signal
      var timeout = setTimeout(() => {
        _close()
      }, peers > 0 ? 1000 * 60 * 5 : 7000)
      this.mapeo.send('close', null, () => {
        logger.debug('IPC closed')
        clearTimeout(timeout)
        _close()
      })
    })
  }
}

module.exports = Main
