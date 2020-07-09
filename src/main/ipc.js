var { dialog, app, ipcMain } = require('electron')

var logger = require('../logger')
var userConfig = require('./user-config')
var i18n = require('./i18n')

/**
 * Miscellaneous ipc calls that don't hit mapeo-core
 */
module.exports = function (win) {
  var ipc = ipcMain

  function ipcSend (...args) {
    try {
      win.webContents.send.apply(win.webContents, args)
    } catch (e) {
      logger.error('exception win.webContents.send', args, e.stack)
    }
  }

  ipc.on('get-user-data', function (event, type) {
    var data = userConfig.getSettings(type)
    if (!data) logger.debug('unhandled event', type)
    event.returnValue = data
  })

  ipc.on('error', function (ev, message) {
    ipcSend('error', message)
  })

  ipc.on('set-locale', function (ev, locale) {
    app.translations = i18n.setLocale(locale)
  })

  ipc.on('get-locale', function (ev) {
    ev.returnValue = i18n.locale
  })

  ipc.on('save-file', function () {
    var metadata = userConfig.getSettings('metadata')
    var ext = metadata ? metadata.dataset_id : 'mapeodata'
    dialog.showSaveDialog(
      {
        title: i18n.t('save-db-dialog'),
        defaultPath: 'database.' + ext,
        filters: [
          {
            name: 'Mapeo Data (*.' + ext + ')',
            extensions: ['mapeodata', 'mapeo-jungle', ext]
          }
        ]
      },
      onopen
    )

    function onopen (filename) {
      if (typeof filename === 'undefined') return
      win.webContents.send('select-file', filename)
    }
  })

  ipc.on('open-file', function () {
    var metadata = userConfig.getSettings('metadata')
    var ext = metadata ? metadata.dataset_id : 'mapeodata'
    dialog.showOpenDialog(
      {
        title: i18n.t('open-db-dialog'),
        properties: ['openFile'],
        filters: [
          {
            name: 'Mapeo Data (*.' + ext + ')',
            extensions: ['mapeodata', 'mapeo-jungle', ext, 'sync', 'zip']
          }
        ]
      },
      onopen
    )

    function onopen (filenames) {
      if (typeof filenames === 'undefined') return
      if (filenames.length === 1) {
        var file = filenames[0]
        win.webContents.send('select-file', file)
      }
    }
  })

  ipc.on('zoom-to-latlon-request', function (_, lon, lat) {
    ipcSend('zoom-to-latlon-response', [lon, lat])
  })

  ipc.on('force-refresh-window', function () {
    ipcSend('force-refresh-window')
  })

  ipc.on('refresh-window', function () {
    ipcSend('refresh-window')
  })
}
