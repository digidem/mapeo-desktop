const Mapeo = require('./mapeo')
const createTileServer = require('./tile-server')
const rabbit = require('electron-rabbit')
const logger = require('../logger')

var mapeo
var handlers = {}

handlers.close = async () => {
  return new Promise((resolve, reject) => {
    if (!mapeo) return resolve()
    mapeo.close(function (err) {
      mapeo = null
      logger.log('now its done', err)
      if (err) return reject(err)
      resolve()
    })
  })
}

handlers.listen = async ({ datadir, userDataPath, port, tileport }) => {
  mapeo = new Mapeo({ datadir, userDataPath, ipcSend: rabbit.send })

  return new Promise((resolve, reject) => {
    logger.log('listening')
    var pending = 2

    // TODO(KM): combine mapeo/server and tile server
    mapeo.listen(port, function () {
      logger.log('got port, resolving', mapeo.server.address().port)
      if (--pending === 0) resolve(mapeo.server.address().port)
    })

    var tileServer = createTileServer(userDataPath)
    tileServer.listen(tileport, function () {
      logger.log('tile server listening on :', tileServer.address().port)
      if (--pending === 0) resolve(mapeo.server.address().port)
    })
  })
}

handlers['import-tiles'] = async (filename) => {
  return new Promise((resolve, reject) => {
    mapeo.tiles.go(filename, function (err) {
      if (err) return reject(err)
      else resolve()
    })
  })
}

handlers['import-data'] = async (filename) => {
  mapeo.core.importer.importFromFile(filename)
}

handlers['sync-start'] = async (target) => {
  mapeo.syncStart(target)
}

handlers['sync-join'] = async () => {
  mapeo.syncJoin()
}

handlers['sync-leave'] = async () => {
  mapeo.syncLeave()
}

handlers['export-data'] = async (args) => {
  logger.log('did i get this', args)
  return new Promise((resolve, reject) => {
    mapeo.exportData(args, function (err) {
      if (err) return reject(err)
      else resolve()
    })
  })
}

handlers['zoom-to-data-get-centroid'] = async (type) => {
  return new Promise((resolve, reject) => {
    mapeo.getDatasetCentroid(type, function (err, loc) {
      logger.log('RESPONSE(getDatasetCentroid):', loc)
      if (err) return reject(err)
      resolve(loc)
    })
  })
}

module.exports = handlers
