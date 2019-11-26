var path = require('path')
var { app, ipcMain } = require('electron')
var logger = require('electron-timber')

var userConfig = require('./user-config')
var i18n = require('./i18n')

/**
 * Miscellaneous ipc calls that don't hit mapeo-core
 */
module.exports = function (win) {
  function ipcSend (...args) {
    try {
      win.webContents.send.apply(win.webContents, args)
    } catch (e) {
      logger.error('exception win.webContents.send', args, e.stack)
    }
  }



  ipcMain.on('message-from-worker', (event, arg) => {
    ipcSend('message-from-mapeo', arg)
  })

  ipcMain.on('get-user-data', function (event, type) {
    var data = userConfig.getSettings(type)
    if (!data) console.warn('unhandled event', type)
    event.returnValue = data
  })

  ipcMain.on('error', function (ev, message) {
    ipcSend('error', message)
  })

  ipcMain.on('set-locale', function (ev, lang) {
    app.translations = i18n.setLocale(lang)
  })

  ipcMain.on('import-example-presets', function (ev) {
    var filename = path.join(
      __dirname,
      '..',
      '..',
      'static',
      'settings-jungle-v1.0.0.mapeosettings'
    )
    userConfig.importSettings(win, filename, function (err) {
      if (err) return logger.error(err)
      logger.log('Example presets imported from ' + filename)
    })
  })

  ipcMain.on('import-settings', function (ev, filename) {
    userConfig.importSettings(win, filename, function (err) {
      if (err) return logger.error(err)
      logger.log('Example presets imported from ' + filename)
    })
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
