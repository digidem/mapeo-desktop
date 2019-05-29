var dialog = require('electron').dialog

var userConfig = require('./user-config')
var i18n = require('../i18n')

module.exports = {
  exportData,
  openDialog
}

function openDialog (app, name, ext) {
  dialog.showSaveDialog({
    title: i18n('menu-export-data-dialog'),
    defaultPath: `export.${ext}`,
    filters: [{ name: name, extensions: [ext] }]
  }, function (filename) {
    if (!filename) return
    exportData(app.server.mapeo, filename, function (err) {
      if (err) dialog.showErrorBox('Error', i18n('menu-export-data-error') + err)
      dialog.showMessageBox({
        message: i18n('menu-export-data-success'),
        buttons: ['OK']
      })
    })
  })
}

function exportData (mapeo, filename, done) {
  var core = mapeo.api.core
  var presets = userConfig.getSettings('presets') || {}
  core.exportData(filename, { presets }, done)
}
