const rabbit = require('electron-rabbit')
const path = require('path')
const events = require('events')

const logger = require('../logger')
const NodePIDmanager = require('../pid-manager')
const createMenu = require('./menu')

class Main extends events.EventEmitter {
  constructor ({
    userDataPath,
    isDev
  }) {
    super()
    this.ready = false
    this.connected = false
    this.isDev = isDev
    this.pid = new NodePIDmanager(userDataPath)

    this.mapeo = new rabbit.Client()
    this.mapPrinter = new rabbit.Client()

    this._findSocket('mapeo', (socket) => {
      this.mapeoSocket = socket
      if (this.mapPrinterSocket) this._ready()
    })
    this._findSocket('mapPrinter', (socket) => {
      this.mapPrinterSocket = socket
      if (this.mapeoSocket) this._ready()
    })
  }

  _connect () {
    this.mapPrinter.connect(this.mapPrinterSocket)
    this.mapeo.connect(this.mapeoSocket)
    this.connected = true
  }

  _ready () {
    if (this.ready) return
    this.ready = true
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
    if (!this.connected) this._connect()
    createMenu(this.mapeoSocket)
    this.pid.create({
      socketName: this.mapeoSocket,
      filepath: path.join(__dirname, 'background', 'mapeo-core', 'index.js')
    }, (err, process) => {
      if (err) logger.error('Failed to start Mapeo Core', err)
      throw new Error('Failed to start Mapeo Core')
    })
  }

  startMapeoHTTPServers (opts, cb) {
    if (!this.connected) this._connect()
    this.pid.cleanup((err) => {
      if (err) logger.debug('No stale processes to clean up')
      else logger.debug('Successfully removed any stale processes')
      logger.debug('waiting for mapeo listen')
      this.mapeo.send('listen', opts, (err, osmServerPort) => {
        if (err) return cb(err)
        logger.debug('got osmServerPort', osmServerPort)
        this.mapPrinter.send('listen', opts, (err, mapPrinterPort) => {
          if (err) return cb(err)
          logger.debug('got mapPrinterPort', osmServerPort)
          return cb(null, { osmServerPort, mapPrinterPort })
        })
      })
    })
  }

  close (cb) {
    this.mapeo.send('get-replicating-peers', null, (err, length) => {
      if (err) logger.error('get-replicating-peers on close', err)

      this.mapPrinter.send('close', null, () => {
        this.mapeo.send('close', null, () => {
          logger.debug('IPC closed')

          this.pid.cleanup((err) => {
            if (err) {
              this.isDev
                ? logger.debug('Nothing to clean up')
                : logger.error('Failed to clean up a child process', err)
            }
            logger.debug('Successfully removed any stale processes')
            cb()
          })
        })
      })
    })
  }
}

module.exports = Main
