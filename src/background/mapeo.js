const path = require('path')
const throttle = require('lodash/throttle')
const MediaStore = require('safe-fs-blob-store')
const Settings = require('@mapeo/settings')
const sublevel = require('subleveldown')
const level = require('level')
const createOsmDbOrig = require('kappa-osm')
const kappa = require('kappa-core')
const raf = require('random-access-file')

const logger = require('../logger')
const TileImporter = require('./tile-importer')
const installStatsIndex = require('./osm-stats')

// This is an RPC wrapper for all the things related to mapeo/core
// much of this code probably could instead be in mapeo/core

class MapeoRPC {
  constructor ({ datadir, userDataPath, ipcSend }) {
    this.storages = []
    this.config = new Settings(userDataPath)
    this.encryptionKey = this.config.getEncryptionKey()
    logger.debug('got encryptionKey', this.encryptionKey)
    this.tiles = TileImporter(userDataPath)

    var feedsDir = path.join(datadir, 'storage')
    var indexDir = path.join(datadir, 'index')

    this.indexDb = level(indexDir)

    const coreDb = kappa(datadir, {
      valueEncoding: 'json',
      encryptionKey: this.encryptionKey
    })

    var createRafStorage = (name, cb) => {
      process.nextTick(() => {
        const storage = raf(path.join(feedsDir, name))
        this.storages.push(storage)
        cb(null, storage)
      })
    }

    // The main osm db for observations and map data
    this.osm = createOsmDbOrig({
      core: coreDb,
      index: this.indexDb,
      storage: createRafStorage
    })

    var idb = sublevel(this.osm.index, 'stats')
    this.osm.core.use('stats', installStatsIndex(idb))

    this.media = MediaStore(path.join(datadir, 'media'))

    this.ipcSend = ipcSend
    this.ipcSend('indexes-loading')
    this.osm.ready(() => {
      logger.debug('indexes READY')
      this.ipcSend('indexes-ready')
    })

    // Sending data over IPC is costly, and progress events fire frequently, so we
    // throttle updates to once every 50ms
    this._throttledSendPeerUpdate = throttle(this._sendPeerUpdate, 50)
    this._throttledSendPeerUpdate = this._throttledSendPeerUpdate.bind(this)
    this._onNewPeer = this._onNewPeer.bind(this)
  }

  listen (core, cb) {
    this.core = core
    this.core.sync.on('peer', this._onNewPeer)
    this.core.sync.on('down', this._throttledSendPeerUpdate)

    this.closing = false

    // TODO(KM): this progress code isn't being caught & rendered by frontend
    var importer = this.core.importer
    importer.on('error', (err, filename) => {
      this.ipcSend('import-error', err.toString())
    })

    importer.on('complete', (filename) => {
      this.ipcSend('import-complete', path.basename(filename))
    })

    importer.on('progress', (filename, index, total) => {
      this.ipcSend(
        'import-progress',
        path.basename(filename),
        index,
        total
      )
    })

    this.core.on('error', this._handleError)
    this.core.sync.listen((err) => {
      cb(err)
    })
  }

  _syncWatch (sync) {
    const startTime = Date.now()
    var onerror = (err) => {
      logger.error('sync', err)
      // We handle errors separately/differently for sync
      // instead of sending to _handleError
      sync.removeListener('error', onerror)
      sync.removeListener('progress', this._throttledSendPeerUpdate)
      sync.removeListener('end', onend)
    }

    var onend = (err) => {
      if (err) logger.error('sync error', err)
      this.ipcSend('sync-complete')
      const syncDurationSecs = ((Date.now() - startTime) / 1000).toFixed(2)
      logger.info('Sync completed in ' + syncDurationSecs + ' seconds')
      sync.removeListener('error', onerror)
      sync.removeListener('progress', this._throttledSendPeerUpdate)
      sync.removeListener('end', onend)
      this._sendPeerUpdate()
    }

    sync.on('error', onerror)
    sync.on('progress', this._throttledSendPeerUpdate)
    sync.on('end', onend)
  }

  _onNewPeer (peer) {
    this._throttledSendPeerUpdate(peer)
    if (!peer.sync) {
      return logger.error('sync', new Error('Could not monitor peer, missing sync property'))
    }
    peer.sync.once('sync-start', () => {
      this._syncWatch(peer.sync)
    })
  }

  syncStart (target = {}) {
    logger.info('Sync start request:', target)

    const sync = this.core.sync.replicate(target, {
      projectKey: this.encryptionKey
    })
    this._sendPeerUpdate()
    this._syncWatch(sync)
  }

  syncJoin () {
    try {
      logger.debug(
        'Joining swarm',
        this.encryptionKey && this.encryptionKey.slice(0, 4)
      )
      this.core.sync.join(this.encryptionKey)
    } catch (e) {
      logger.error('syncJoin', e)
    }
  }

  syncLeave () {
    try {
      logger.debug(
        'Leaving swarm',
        this.encryptionKey && this.encryptionKey.slice(0, 4)
      )
      this.core.sync.leave(this.encryptionKey)
    } catch (e) {
      logger.error('syncLeave', e)
    }
  }

  exportData ({ filename, format, id }, cb) {
    const presets = this.config.getSettings('presets') || {}
    logger.info('Exporting', filename, format)
    this.core.exportData(filename, { format, presets }, cb)
  }

  onReplicationComplete (cb) {
    // Wait for up to 5 minutes for replication to complete
    const timeoutId = setTimeout(() => {
      this.core.sync.removeListener('down', checkIfDone)
      cb()
    }, 5 * 60 * 1000)

    var checkIfDone = () => {
      const currentlyReplicatingPeers = this.core.sync
        .peers()
        .filter(
          peer =>
            peer.state &&
            (peer.state.topic === 'replication-started' ||
              peer.state.topic === 'replication-progress')
        )
      logger.info(currentlyReplicatingPeers.length + ' peers still replicating')
      if (currentlyReplicatingPeers.length === 0) {
        clearTimeout(timeoutId)
        return cb()
      }
      this.core.sync.once('down', checkIfDone)
    }

    checkIfDone()
  }

  getDatasetCentroid (type, done) {
    this.osm.core.api.stats.getMapCenter(type, function (err, center) {
      if (err) return logger.error(`api.stats.getMapCenter(${type})`, err)
      if (!center) return done(null, null)
      logger.info('RESPONSE(getDatasetCentroid):', type, center)
      done(null, [center.lon, center.lat])
    })
  }

  close (cb) {
    // Prevents close from being called twice in a row
    if (this.closing || !this.core) return process.nextTick(cb)
    this.closing = true
    let pending = this.storages.length + 2

    this.core.sync.removeListener('peer', this._onNewPeer)
    this.core.sync.removeListener('down', this._throttledSendPeerUpdate)
    this.onReplicationComplete(() => {
      this.core.close(() =>
        this.osm.core.pause(() => {
          this.osm.core._logs.close(done)
          this.storages.forEach(storage => {
            storage.close(done)
          })
          this.indexDb.close(done)
        })
      )
    })

    var done = () => {
      if (--pending) return
      this.closing = false
      cb()
    }
  }

  _handleError (err) {
    if (typeof err === 'string') err = new Error(err)
    logger.error('mapeo', err)
    this.ipcSend('error', err)
  }

  // Send message to frontend whenever there is an update to the peer list
  _sendPeerUpdate (peer) {
    const peers = this.core.sync.peers().map(peer => {
      const { connection, ...rest } = peer
      return rest
    })
    this.ipcSend('peer-update', peers)
  }
}

module.exports = MapeoRPC
