var path = require('path')
var throttle = require('lodash/throttle')
var logger = require('electron-timber')
var { ipcMain } = require('electron')

var userConfig = require('./user-config')
var core = require('./core')

// TODO: clean up & wrap in better rpc logic..
module.exports = function (win, argv) {
  function ipcSend (...args) {
    try {
      win.webContents.send.apply(win.webContents, args)
    } catch (e) {
      logger.error('exception win.webContents.send', args, e.stack)
    }
  }
  logger.log('loading mapeo', argv)
  var mapeo = core(argv)

  win.webContents.once('did-finish-load', function () {
    logger.log('preparing osm indexes..')
    ipcSend('indexes-loading')
    mapeo.osm.ready(function () {
      logger.log('indexes READY')
      ipcSend('indexes-ready')
    })
  })

  var importer = mapeo.importer

  importer.on('error', function (err, filename) {
    ipcSend('import-error', err.toString())
  })

  importer.on('complete', function (filename) {
    ipcSend('import-complete', path.basename(filename))
  })

  importer.on('progress', function (filename, index, total) {
    ipcSend(
      'import-progress',
      path.basename(filename),
      index,
      total
    )
  })

  // Sending data over IPC is costly, and progress events fire frequently, so we
  // throttle updates to once every 50ms
  const throttledSendPeerUpdate = throttle(sendPeerUpdate, 50)

  mapeo.sync.on('peer', onNewPeer)
  mapeo.sync.on('down', throttledSendPeerUpdate)
  ipcMain.on('sync-start', startSync)
  ipcMain.on('export-data', exportData)
  ipcMain.on('zoom-to-data-get-centroid', function (_, type) {
    getDatasetCentroid(type, function (_, loc) {
      logger.log('RESPONSE(getDatasetCentroid):', loc)
      if (!loc) return
      ipcSend('zoom-to-data-response', loc)
    })
  })

  var origClose = mapeo.close
  mapeo.close = (cb) => {
    mapeo.sync.removeListener('peer', onNewPeer)
    mapeo.sync.removeListener('down', throttledSendPeerUpdate)
    ipcMain.removeListener('start-sync', startSync)
    ipcMain.removeListener('export-data', exportData)
    onReplicationComplete(() => {
      origClose.call(mapeo, cb)
    })
  }

  return mapeo

  function getDatasetCentroid (type, done) {
    logger.log('STATUS(getDatasetCentroid):', type)
    mapeo.osm.core.api.stats.getMapCenter(type, function (err, center) {
      if (err) return logger.error('ERROR(getDatasetCentroid):', err)
      if (!center) return done(null, null)
      done(null, [center.lon, center.lat])
    })
  }



  function onNewPeer (peer) {
    throttledSendPeerUpdate(peer)
    if (!peer.sync) {
      return logger.error('Could not monitor peer, missing sync property')
    }
    peer.sync.once('sync-start', () => {
      watchSync(peer.sync)
    })
  }

  // Send message to frontend whenever there is an update to the peer list
  function sendPeerUpdate (peer) {
    const peers = mapeo.sync.peers().map(peer => {
      const { connection, ...rest } = peer
      return rest
    })
    ipcSend('peer-update', peers)
  }

  function watchSync (sync) {
    const startTime = Date.now()
    sync.on('error', onerror)
    sync.on('progress', throttledSendPeerUpdate)
    sync.on('end', onend)

    function onerror (err) {
      logger.error(err)
      sync.removeListener('error', onerror)
      sync.removeListener('progress', throttledSendPeerUpdate)
      sync.removeListener('end', onend)
    }

    function onend (err) {
      if (err) logger.error(err)
      ipcSend('sync-complete')
      const syncDurationSecs = ((Date.now() - startTime) / 1000).toFixed(2)
      logger.log('Sync completed in ' + syncDurationSecs + ' seconds')
      sync.removeListener('error', onerror)
      sync.removeListener('progress', throttledSendPeerUpdate)
      sync.removeListener('end', onend)
      sendPeerUpdate()
    }
  }

  function startSync (event, target = {}) {
    logger.log('Sync start request:', target)
    // if (!target.host || !target.port || !target.filename) return

    const sync = mapeo.sync.replicate(target, { deviceType: 'mobile' })
    sendPeerUpdate()
    watchSync(sync)
  }

  function exportData (event, { filename, format, id }) {
    const presets = userConfig.getSettings('presets') || {}
    mapeo.exportData(filename, { format, presets }, err => {
      ipcSend('export-data-' + id, err)
    })
  }

  function onReplicationComplete (cb) {
    // Wait for up to 5 minutes for replication to complete
    const timeoutId = setTimeout(() => {
      mapeo.sync.removeListener('down', checkIfDone)
      cb()
    }, 5 * 60 * 1000)

    checkIfDone()

    function checkIfDone () {
      const currentlyReplicatingPeers = mapeo.sync
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
      mapeo.sync.once('down', checkIfDone)
    }
  }
}
