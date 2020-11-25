// @ts-check
const os = require('os')
const http = require('http')
const concat = require('concat-stream')
const promiseDefer = require('p-defer')

const logger = require('../../logger')

const Mapeo = require('./mapeo')
const createTileServer = require('./tile-server')
const createRouter = require('./server')
const { listen, close } = require('../../utils/async-server')

const channel = new BroadcastChannel('mapeo-core')

/**
 * Broadcast a message to all listeners
 *
 * @param {string} name
 * @param {*} args
 */
function broadcastMessage (name, args) {
  logger.debug('Broadcast message', { name, args })
  channel.postMessage({ name, args })
}

/** @typedef {import('../../utils/types').MapeoCoreOptions} Options */

class MapeoManager {
  /**
   * Creates an instance of MapeoManager.
   * @param {Options} options
   */
  constructor ({ datadir, userDataPath, mapeoServerPort, tileServerPort }) {
    const deferred = promiseDefer()
    this.deferredMapeo = deferred.promise
    /** @type {promiseDefer.DeferredPromise<any>['resolve'] | void} */
    this._resolveMapeo = deferred.resolve
    this.opts = { datadir, userDataPath, mapeoServerPort, tileServerPort }
  }

  async start () {
    logger.info('Creating a new mapeo', this.opts)

    const mapeo = new Mapeo({
      datadir: this.opts.datadir,
      userDataPath: this.opts.userDataPath,
      ipcSend: broadcastMessage
    })

    var { router, core } = createRouter(mapeo.osm, mapeo.media, {
      staticRoot: this.opts.userDataPath,
      ipcSend: broadcastMessage
    })

    // Sets up listening for sync
    await mapeo.listen(core)

    if (!this._resolveMapeo) throw new Error('Unexpected error')
    this._resolveMapeo(mapeo)
    this._resolveMapeo = undefined // Let's be extra-careful not to resolve twice

    // hostname often includes a TLD, which we remove
    const computerName = (os.hostname() || 'Mapeo Desktop').split('.')[0]
    mapeo.core.sync.setName(computerName)

    this.mapeoServer = http.createServer((req, res) => {
      logger.debug('server request', req.url)
      router(req, res)
    })
    const mapeoServerUrl = await listen(
      this.mapeoServer,
      this.opts.mapeoServerPort,
      '127.0.0.1'
    )
    logger.info('osm-p2p-server listening on:', mapeoServerUrl)

    this.tileServer = createTileServer(this.opts.userDataPath)
    const tileServerUrl = await listen(
      this.tileServer,
      this.opts.tileServerPort,
      '127.0.0.1'
    )
    logger.info('Tile server listening on:', tileServerUrl)
  }

  async reloadConfig () {
    logger.debug('Closing old mapeo')
    await this.close()
    logger.debug('old mapeo closed')
    await this.start()
    logger.info('Configuration reloaded')
  }

  async close () {
    const mapeo = await this.deferredMapeo

    // Setup a new deferred promise that will handle any requests made whilst
    // current mapeo is closing
    const deferred = promiseDefer()
    this.deferredMapeo = deferred.promise
    this._resolveMapeo = deferred.resolve

    await mapeo.close()
    logger.debug('Closed Mapeo Core')

    if (this.mapeoServer && this.mapeoServer.listening) {
      await close(this.mapeoServer)
      logger.debug('Closed Mapeo Server')
    }

    if (this.tileServer && this.tileServer.listening) {
      await close(this.tileServer)
      logger.debug('Closed Tile Server')
    }
  }
}

/**
 * @param {Options} opts
 * @returns {import('../../utils/types').BackgroundProcess}
 */
module.exports = function init (opts) {
  /** @type {import('../../utils/types').BackgroundProcess['handlers']} */
  var handlers = {}
  var manager = new MapeoManager(opts)

  handlers['reload-config'] = async () => manager.reloadConfig()

  /** @type {(filename: string) => Promise<void>} */
  handlers['import-tiles'] = async filename => {
    const mapeo = await manager.deferredMapeo
    return new Promise((resolve, reject) => {
      // @ts-ignore
      mapeo.tiles.go(filename, err => {
        if (err) {
          logger.error(`mapeo.tiles.go(${filename})`, err)
          return reject(err)
        } else resolve()
      })
    })
  }

  handlers['encryption-key'] = async () => {
    const mapeo = await manager.deferredMapeo
    return mapeo.encryptionKey
  }

  /** @type {(filename: string) => Promise<void>} */
  handlers['import-data'] = async filename => {
    const mapeo = await manager.deferredMapeo
    mapeo.core.importer.importFromFile(filename)
  }

  /** @type {(info: {target: any, createFile: ?boolean}) => Promise<void>} */
  handlers['sync-start'] = async ({ target, createFile }) => {
    const mapeo = await manager.deferredMapeo
    mapeo.syncStart(target, createFile)
  }

handlers['sync-connect'] = async (url) => {
  manager.mapeo.syncConnect(url)
}

handlers['sync-join'] = async () => {
  manager.mapeo.syncJoin()
}

  handlers['sync-leave'] = async () => {
    const mapeo = await manager.deferredMapeo
    mapeo.syncLeave()
  }

  /** @type {(args: any) => Promise<void>} */
  handlers['export-data'] = async args => {
    logger.info('Exporting data', args)
    const mapeo = await manager.deferredMapeo
    return new Promise((resolve, reject) => {
      // @ts-ignore
      mapeo.exportData(args, err => {
        if (err) {
          logger.error(`mapeo.exportData(${args})`, err)
          return reject(err)
        }
        resolve()
      })
    })
  }

  handlers['get-data'] = async opts => {
    logger.info('Exporting data stream', opts)
    const mapeo = await manager.deferredMapeo
    return new Promise((resolve, reject) => {
      const rs = mapeo.core.createDataStream(opts)
      rs.on('error', err => {
        logger.error(`mapeo.createDataStream(${opts})`, err)
        rs.destroy()
        return reject(err)
      })
      rs.pipe(
        concat(stream => {
          resolve(JSON.parse(stream))
        })
      )
    })
  }

  handlers['zoom-to-data-get-centroid'] = async type => {
    const mapeo = await manager.deferredMapeo
    return new Promise((resolve, reject) => {
      // @ts-ignore
      mapeo.getDatasetCentroid(type, (err, loc) => {
        if (err) {
          logger.error(`mapeo.getDatasetCentroid(${type})`, err)
          return reject(err)
        }
        resolve(loc)
      })
    })
  }

  handlers['get-replicating-peers'] = async () => {
    const mapeo = await manager.deferredMapeo
    return mapeo.getReplicatingPeers().length
  }

  handlers['get-database-status'] = async () => {
    const mapeo = await manager.deferredMapeo
    return new Promise((resolve, reject) => {
      // @ts-ignore
      mapeo.core.getFeedStatus((err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  }

  /** @type {(bool: boolean) => Promise<void>} */
  handlers.debugging = async bool => {
    logger.debugging(bool)
  }

  return {
    start: async () => manager.start(),
    close: async () => manager.close(),
    handlers
  }
}
