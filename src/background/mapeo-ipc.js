const Mapeo = require('./mapeo')
const createTileServer = require('./tile-server')
const rabbit = require('electron-rabbit')
const logger = require('../logger')
const createRouter = require('./server')
const os = require('os')
const http = require('http')

class MapeoManager {
  constructor ({ datadir, userDataPath, port, tileport }) {
    this.mapeo = null
    this.tileServer = null
    this.opts = { datadir, userDataPath, port, tileport }
    this.router = null
  }

  listen (cb) {
    let pending = 2
    logger.log('manager.listen')

    this._createMapeo(() => {
      if (!this.server) {
        logger.log('creating a server')
        this.server = http.createServer((req, res) => {
          logger.log('server request', req.url)
          this.router(req, res)
        })
      }
      this.server.listen(this.opts.port, '127.0.0.1', () => {
        logger.log('osm-p2p-server listening on :', this.server.address().port)
        if (--pending === 0) cb(this.server.address().port)
      })
    })

    this.tileServer = createTileServer(this.opts.userDataPath)
    this.tileServer.listen(this.opts.tileport, () => {
      logger.log('tile server listening on :', this.tileServer.address().port)
      if (--pending === 0) cb(this.mapeo.server.address().port)
    })
  }

  _createMapeo (cb) {
    var ipcSend = rabbit.send
    logger.log('creating a new mapeo', this.opts)
    this.mapeo = new Mapeo({
      datadir: this.opts.datadir,
      userDataPath: this.opts.userDataPath,
      ipcSend
    })
    logger.log('encryption key', this.mapeo.encryptionKey)

    var { router, core } = createRouter(this.mapeo.osm, this.mapeo.media, {
      staticRoot: this.opts.userDataPath,
      ipcSend
    })

    logger.log('new router')
    this.router = router

    this.mapeo.listen(core, () => {
      // hostname often includes a TLD, which we remove
      const computerName = (os.hostname() || 'Mapeo Desktop').split('.')[0]
      this.mapeo.core.sync.setName(computerName)
      cb()
    })
  }

  reloadConfig (cb) {
    logger.log('closing old mapeo')
    this.mapeo.close(() => {
      this.mapeo = null
      logger.log('opening new one')
      this._createMapeo(cb)
    })
  }

  close (cb) {
    if (!this.mapeo) return cb()
    this.mapeo.close((err) => {
      if (err) return cb(err)
      this.mapeo = null
      this.server.close((err) => {
        if (err) return cb(err)
        this.server = null
        this.tileServer.close((err) => {
          if (err) return cb(err)
          this.tileServer = null
          cb()
        })
      })
    })
  }
}

var handlers = {}
var manager = null

handlers['reload-config'] = async () => {
  return new Promise((resolve, reject) => {
    manager.reloadConfig((err) => {
      logger.log('config reloaded', err)
      if (err) reject(err)
      resolve()
    })
  })
}

handlers.close = async () => {
  return new Promise((resolve, reject) => {
    if (!manager) return resolve()
    logger.log('Closing!')
    manager.close((err) => {
      logger.log('now its done', err)
      if (err) return reject(err)
      resolve()
    })
  })
}

handlers.listen = async (opts) => {
  if (!manager) manager = new MapeoManager(opts)
  return new Promise((resolve, reject) => {
    logger.log('listening')

    manager.listen((port) => {
      logger.log('got port, resolving', port)
      resolve(port)
    })
  })
}

handlers['import-tiles'] = async (filename) => {
  return new Promise((resolve, reject) => {
    manager.mapeo.tiles.go(filename, (err) => {
      if (err) return reject(err)
      else resolve()
    })
  })
}

handlers['encryption-key'] = async () => {
  return new Promise((resolve, reject) => {
    resolve(manager.mapeo.encryptionKey)
  })
}

handlers['import-data'] = async (filename) => {
  manager.mapeo.core.importer.importFromFile(filename)
}

handlers['sync-start'] = async (target) => {
  manager.mapeo.syncStart(target)
}

handlers['sync-join'] = async () => {
  manager.mapeo.syncJoin()
}

handlers['sync-leave'] = async () => {
  manager.mapeo.syncLeave()
}

handlers['export-data'] = async (args) => {
  logger.log('did i get this', args)
  return new Promise((resolve, reject) => {
    manager.mapeo.exportData(args, (err) => {
      if (err) return reject(err)
      else resolve()
    })
  })
}

handlers['zoom-to-data-get-centroid'] = async (type) => {
  return new Promise((resolve, reject) => {
    manager.mapeo.getDatasetCentroid(type, (err, loc) => {
      logger.log('RESPONSE(getDatasetCentroid):', loc)
      if (err) return reject(err)
      resolve(loc)
    })
  })
}

module.exports = handlers
