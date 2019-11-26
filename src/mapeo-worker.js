const fs = require('fs')
const path = require('path')
const throttle = require('lodash/throttle')
const logger = require('electron-timber')
const createMapeoServer = require('./src/main/server')
const randombytes = require('randombytes')
const os = require('os')
const MapeoCore = require('@mapeo/core')
const sublevel = require('subleveldown')

const installStatsIndex = require('./osm-stats')
const userConfig = require('./user-config')

const errors = MapeoCore.errors

const expectedMediaFormats = ['original', 'preview', 'thumbnail']

class MapeoRPC {
  constructor (datadir, ipcSend) {
    // TODO: bind all the things since they're being passed
    // around a lot to various event listeners...
    this.mapeo = createMapeo(datadir)
    this.ipcSend = ipcSend
    this.ipcSend('indexes-loading')
    this.mapeo.osm.ready(() => {
      logger.log('indexes READY')
      this.ipcSend('indexes-ready')
    })

    // Sending data over IPC is costly, and progress events fire frequently, so we
    // throttle updates to once every 50ms
    this._throttledSendPeerUpdate = throttle(this.sendPeerUpdate, 50)
    this.mapeo.sync.on('peer', this.onNewPeer)
    this.mapeo.sync.on('down', this._throttledSendPeerUpdate)

    var origClose = this.mapeo.close
    this.mapeo.close = (cb) => {
      this.mapeo.sync.removeListener('peer', this.onNewPeer)
      this.mapeo.sync.removeListener('down', this._throttledSendPeerUpdate)
      this.onReplicationComplete(() => {
        origClose.call(this.mapeo, cb)
      })
    }

    this.mapeo.on('error', this._handleError)

    this.mapeo.importer.on('error', (err, filename) => {
      ipcSend('import-error', err.toString())
    })

    this.mapeo.importer.on('complete', (filename) => {
      ipcSend('import-complete', path.basename(filename))
    })

    this.mapeo.importer.on('progress', (filename, index, total) => {
      ipcSend(
        'import-progress',
        path.basename(filename),
        index,
        total
      )
    })
  }

  listen (userDataPath, port, cb) {
    logger.log('mapeo initializing', userDataPath)
    this.server = createMapeoServer(this.mapeo, {
      staticRoot: userDataPath
    })
    this.mapeo.sync.listen(() => {
      logger.log('mapeo-core sync server is listening')
      this.server.listen(port, '127.0.0.1', function () {
        logger.log('mapeo-server + osm-p2p-server: listening')
        cb()
      })
    })
  }

  watchSync (sync) {
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
      this.sendPeerUpdate()
    }

    sync.on('error', onerror)
    sync.on('progress', this._throttledSendPeerUpdate)
    sync.on('end', onend)
  }

  // Send message to frontend whenever there is an update to the peer list
  sendPeerUpdate (peer) {
    const peers = this.mapeo.sync.peers().map(peer => {
      const { connection, ...rest } = peer
      return rest
    })
    this.ipcSend('peer-update', peers)
  }

  onNewPeer (peer) {
    this._throttledSendPeerUpdate(peer)
    if (!peer.sync) {
      return logger.error('Could not monitor peer, missing sync property')
    }
    peer.sync.once('sync-start', () => {
      this.watchSync(peer.sync)
    })
  }

  startSync (event, target = {}) {
    logger.log('Sync start request:', target)
    // if (!target.host || !target.port || !target.filename) return

    const sync = this.mapeo.sync.replicate(target, { deviceType: 'mobile' })
    this.sendPeerUpdate()
    this.watchSync(sync)
  }

  exportData ({ filename, format, id }) {
    const presets = userConfig.getSettings('presets') || {}
    this.mapeo.exportData(filename, { format, presets }, err => {
      this.ipcSend('export-data-' + id, err)
    })
  }

  onReplicationComplete (cb) {
    // Wait for up to 5 minutes for replication to complete
    const timeoutId = setTimeout(() => {
      this.mapeo.sync.removeListener('down', checkIfDone)
      cb()
    }, 5 * 60 * 1000)

    checkIfDone()

    function checkIfDone () {
      const currentlyReplicatingPeers = this.mapeo.sync
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
      this.mapeo.sync.once('down', checkIfDone)
    }
  }

  mediaGet (m) {
    // TODO: REFACTOR THIS
    var id = m.type + '/' + m.id

    this.mapeo.media.exists(id, (err, exists) => {
      if (err) return this.handleError(err)
      if (!exists) return this.handleError(errors.NotFound())
      //this.mapeo.media.createReadStream(id).pipe(res)
    })
  }

  mediaPost (media, opts, cb) {
    let pending = expectedMediaFormats.length
    const errorSent = false

    if (!media) return this._handleError(new Error('Empty media request'))

    for (const format of expectedMediaFormats) {
      if (!media[format]) return this._handleError(new Error(`Request body is missing ${format} property`))
      if (!fs.existsSync(media[format])) return this._handleError(new Error(`File ${media[format]} does not exist`))
    }

    // Use the extension of the original media - assumes thumbnail and preview
    // is the same format / has the same extension.
    const ext = path.extname(media.original)
    const newMediaId = randombytes(16).toString('hex') + ext

    for (const format of expectedMediaFormats) {
      var destPath = format + '/' + newMediaId
      var file = media[format]
      var ws = this.mapeo.media.createWriteStream(destPath, done)
      fs.createReadStream(file).pipe(ws)
    }

    function done (err) {
      if (err) return this._handleError(new Error('There was a problem saving the media to the server'))
      if (--pending) return
      if (errorSent) return

      cb(null, { id: newMediaId })
    }
  }

  getDatasetCentroid (type, done) {
    logger.log('STATUS(getDatasetCentroid):', type)
    this.mapeo.osm.core.api.stats.getMapCenter(type, function (err, center) {
      if (err) return logger.error('ERROR(getDatasetCentroid):', err)
      if (!center) return done(null, null)
      done(null, [center.lon, center.lat])
    })
  }

  close (cb) {
    this.mapeo.sync.close(cb)
  }

  _handleError (err) {
    if (typeof err === 'string') err = new Error(err)
    if (!err.status) err = errors(err)
    logger.error(err)
    this.ipcSend('error', err)
  }
}

module.exports = MapeoRPC

function createMapeo (datadir) {
  var opts = {
    id: 'MapeoDesktop_' + randombytes(8).toString('hex'),
    writeFormat: 'osm-p2p-syncfile',
    deviceType: 'desktop'
  }

  var mapeo = new MapeoCore(datadir, path.join(datadir, 'media'), opts)
  // hostname often includes a TLD, which we remove
  const computerName = (os.hostname() || 'Mapeo Desktop').split('.')[0]
  mapeo.sync.setName(computerName)

  var idb = sublevel(mapeo.osm.index, 'stats')
  mapeo.osm.core.use('stats', installStatsIndex(idb))

  return mapeo
}


// TODO: create RPC wrapper
var manifest = {
  listen: 'async',
  getDatasetCentroid: 'async',
  getDeviceId: 'async',
  observationDelete: 'async',
  observationList: 'async',
  observationCreate: 'async',
  observationGet: 'async',
  observationUpdate: 'async',
  observationConvert: 'async',
  syncJoin: 'sync',
  syncLeave: 'sync',
  syncDestroy: 'async',
  syncListen: 'async',
  syncPeers: 'sync',
  mediaGet: 'async',
  mediaPost: 'async'
}

var api = rpc.exportAPI('mapeo', manifest, MapeoRPC)

