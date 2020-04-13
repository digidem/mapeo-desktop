const path = require('path')
const throttle = require('lodash/throttle')
const MediaStore = require('safe-fs-blob-store')
const osmdb = require('osm-p2p')
const os = require('os')
const Settings = require('@mapeo/settings')
const sublevel = require('subleveldown')

const logger = require('../logger')
const TileImporter = require('./tile-importer')
const createServer = require('./server')
const installStatsIndex = require('./osm-stats')

// This is an RPC wrapper for all the things related to mapeo/core
// much of this code probably could instead be in mapeo/core

class MapeoRPC {
  constructor ({ datadir, userDataPath, ipcSend }) {
    this.config = new Settings(userDataPath)
    this.projectKey = this.config.getEncryptionKey()
    logger.log('got projectKey', this.projectKey)
    this.tiles = TileImporter(userDataPath)

    logger.log('loading datadir', datadir)
    this.osm = osmdb({
      dir: datadir,
      encryptionKey: this.projectKey
    })

    var idb = sublevel(this.osm.index, 'stats')
    this.osm.core.use('stats', installStatsIndex(idb))

    this.media = MediaStore(path.join(datadir, 'media'))

    // hostname often includes a TLD, which we remove
    const computerName = (os.hostname() || 'Mapeo Desktop').split('.')[0]

    this.server = createServer(this.osm, this.media, {
      staticRoot: userDataPath,
      ipcSend
    })

    // TODO(KM): remove this.server.mapeo.* calls to prevent leaky abstraction
    // ideally, the server doesn't need to know about the mapeo or osm objects
    // instead, we could instantiate mapeo outside of the server,
    // this would require breaking changes on both core+server
    this.core = this.server.mapeoRouter.api.core

    var importer = this.core.importer

    importer.on('error', function (err, filename) {
      ipcSend('import-error', err.toString())
    })

    importer.on('complete', function (filename) {
      ipcSend('import-complete', path.basename(filename))
    })

    importer.on('progress', function (filename, index, total) {
      // TODO(KM): im pretty sure this doesnt work..
      ipcSend(
        'import-progress',
        path.basename(filename),
        index,
        total
      )
    })

    this.core.sync.setName(computerName)

    this.ipcSend = ipcSend
    this.ipcSend('indexes-loading')
    this.osm.ready(() => {
      logger.log('indexes READY')
      this.ipcSend('indexes-ready')
    })

    // Sending data over IPC is costly, and progress events fire frequently, so we
    // throttle updates to once every 50ms
    this._throttledSendPeerUpdate = throttle(this._sendPeerUpdate, 50)
    this._throttledSendPeerUpdate = this._throttledSendPeerUpdate.bind(this)
    this._onNewPeer = this._onNewPeer.bind(this)
    this.core.sync.on('peer', this._onNewPeer)
    this.core.sync.on('down', this._throttledSendPeerUpdate)

    var origClose = this.core.close
    this.core.close = (cb) => {
      this.core.sync.removeListener('peer', this._onNewPeer)
      this.core.sync.removeListener('down', this._throttledSendPeerUpdate)
      this.onReplicationComplete(() => {
        this.core.sync.destroy(() => origClose.call(this.core, cb))
      })
    }

    this.core.on('error', this._handleError)
  }

  listen (port, cb) {
    this.core.sync.listen(() => {
      logger.log('mapeo-core sync server is listening')
      this.server.listen(port, '127.0.0.1', () => {
        logger.log('mapeo-server + osm-p2p-server: listening')
        cb(this.server.address().port)
      })
    })
  }

  _syncWatch (sync) {
    const startTime = Date.now()
    var onerror = (err) => {
      logger.error(err)
      sync.removeListener('error', onerror)
      sync.removeListener('progress', this._throttledSendPeerUpdate)
      sync.removeListener('end', onend)
    }

    var onend = (err) => {
      if (err) logger.error(err)
      this.ipcSend('sync-complete')
      const syncDurationSecs = ((Date.now() - startTime) / 1000).toFixed(2)
      logger.log('Sync completed in ' + syncDurationSecs + ' seconds')
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
      return logger.error('Could not monitor peer, missing sync property')
    }
    peer.sync.once('sync-start', () => {
      this._syncWatch(peer.sync)
    })
  }

  syncStart (target = {}) {
    logger.log('Sync start request:', target)
    logger.log('sync starting', target)

    const sync = this.core.sync.replicate(target, {
      projectKey: this.projectKey
    })
    this._sendPeerUpdate()
    this._syncWatch(sync)
  }

  syncJoin () {
    try {
      logger.log(
        'Joining swarm',
        this.projectKey && this.projectKey.slice(0, 4)
      )
      this.core.sync.join(this.projectKey)
    } catch (e) {
      logger.error('sync join error', e)
    }
  }

  syncLeave () {
    try {
      logger.log(
        'Leaving swarm',
        this.projectKey && this.projectKey.slice(0, 4)
      )
      this.core.sync.leave(this.projectKey)
    } catch (e) {
      logger.error('sync leave error', e)
    }
  }

  exportData ({ filename, format, id }, cb) {
    const presets = this.config.getSettings('presets') || {}
    logger.log('down here exporting', filename, format)
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
      logger.log(currentlyReplicatingPeers.length + ' peers still replicating')
      if (currentlyReplicatingPeers.length === 0) {
        clearTimeout(timeoutId)
        return cb()
      }
      this.core.sync.once('down', checkIfDone)
    }

    checkIfDone()
  }

  getDatasetCentroid (type, done) {
    logger.log('STATUS(getDatasetCentroid):', type)
    this.osm.core.api.stats.getMapCenter(type, function (err, center) {
      if (err) return logger.error('ERROR(getDatasetCentroid):', err)
      if (!center) return done(null, null)
      logger.log('RESPONSE(getDatasetCentroid):', center)
      done(null, [center.lon, center.lat])
    })
  }

  close (cb) {
    this.core.close((err) => {
      if (err) return cb(err)
      this.server.close((err) => {
        cb(err)
      })
    })
  }

  _handleError (err) {
    if (typeof err === 'string') err = new Error(err)
    logger.error(err)
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
