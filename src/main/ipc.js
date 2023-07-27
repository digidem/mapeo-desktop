const { dialog, app, ipcMain } = require('electron')

const updater = require('./auto-updater')
const logger = require('../logger')
const userConfig = require('./user-config')
const i18n = require('./i18n')

/**
 * Miscellaneous ipcMain calls that don't hit mapeo-core
 */
module.exports = function (ipcSend) {
  function onError (err) {
    logger.error('[MAIN/IPC] error', err)
    ipcSend('error', err.message, err.stack)
  }

  updater.on('error', err => {
    if (err.message.match(/net*/)) logger.debug(err.message)
    else {
      logger.error('[UPDATER] error', err)
      ipcSend('update-status', 'update-error', err)
    }
  })

  updater.on('update-inactive', () => {
    ipcSend('update-status', 'update-inactive')
  })

  updater.updateDownloaded(updateInfo => {
    logger.info('[UPDATER] update-downloaded', updateInfo)
    ipcSend('update-status', 'update-downloaded', updateInfo)
  })

  updater.updateNotAvailable(() => {
    logger.info('[UPDATER] update-not-available')
    ipcSend('update-status', 'update-not-available', null)
  })

  updater.downloadProgress(updateInfo => {
    logger.info('[UPDATER] update-progress', updateInfo)
    /*
      {
        progress: {
          total: 141164463,
          delta: 1655048,
          transferred: 11384326,
          percent: 8.064583506402741,
          bytesPerSecond: 2244544
        }
      }
    */

    ipcSend('update-status', 'update-progress', updateInfo)
  })

  updater.updateAvailable(updateInfo => {
    // version, files, path, sha512, releaseDate
    logger.info('[UPDATER] update-available', updateInfo)
    ipcSend('update-status', 'update-available', updateInfo)
  })

  ipcMain.on('download-update', function (event) {
    updater.downloadUpdate()
  })

  ipcMain.on('check-for-updates', function (event) {
    updater.checkForUpdates()
  })

  ipcMain.on('quit-and-install', function (event) {
    updater.quitAndInstall()
  })

  ipcMain.on('get-user-data', function (event, type) {
    var data = userConfig.getSettings(type)
    if (!data) logger.debug('Could not get data for', type)
    event.returnValue = data
  })

  ipcMain.on('error', function (ev, message) {
    onError(new Error(message))
  })

  ipcMain.on('set-locale', function (ev, locale) {
    app.translations = i18n.setLocale(locale)
    i18n.save()
    ipcSend('CLOSING:update-message', i18n.t('closing-screen'))
  })

  ipcMain.on('get-locale', function (ev) {
    ev.returnValue = i18n.locale
  })

  ipcMain.handle('CLOSING:get-message', function () {
    return i18n.t('closing-screen')
  })

  ipcMain.handle('select-mb-tile-file', async function () {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'MbTiles', extensions: ['mbtiles'] }],
      properties: ['openFile']
    })

    return result
  })

  ipcMain.on('save-file', function () {
    var metadata = userConfig.getSettings('metadata')
    var ext = metadata ? metadata.dataset_id : 'mapeodata'
    dialog
      .showSaveDialog({
        title: i18n.t('save-db-dialog'),
        defaultPath: 'database.' + ext,
        filters: [
          {
            name: 'Mapeo Data (*.' + ext + ')',
            extensions: ['mapeodata', 'mapeo-jungle', ext]
          }
        ]
      })
      .then(onOpen)
      .catch(onError)

    function onOpen ({ filePath, canceled }) {
      if (canceled || typeof filePath === 'undefined') return
      ipcSend('select-file', filePath)
    }
  })

  ipcMain.on('open-file', function () {
    var metadata = userConfig.getSettings('metadata')
    var ext = metadata ? metadata.dataset_id : 'mapeodata'
    dialog
      .showOpenDialog({
        title: i18n.t('open-db-dialog'),
        properties: ['openFile'],
        filters: [
          {
            name: 'Mapeo Data (*.' + ext + ')',
            extensions: ['mapeodata', 'mapeo-jungle', ext, 'sync', 'zip']
          }
        ]
      })
      .then(onOpen)
      .catch(onError)

    function onOpen ({ canceled, filePaths }) {
      if (canceled || typeof filePaths === 'undefined') return
      if (filePaths.length === 1) {
        var file = filePaths[0]
        ipcSend('select-file', file)
      }
    }
  })

  ipcMain.on('zoom-to-latlon-request', function (_, lon, lat) {
    ipcSend('zoom-to-latlon-response', [lon, lat])
  })

  ipcMain.on('force-refresh-window', function () {
    ipcSend('force-refresh-window')
  })

  ipcMain.on('refresh-window', function () {
    ipcSend('refresh-window')
  })
}
