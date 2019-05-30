var dialog = require('electron').dialog

var userConfig = require('./user-config')
var i18n = require('../i18n')

module.exports = openDialog

function openDialog (app, name, format) {
  var ext = (format === 'shapefile') ? 'zip' : format
  dialog.showSaveDialog({
    title: i18n('menu-export-data-dialog'),
    defaultPath: `Mapeo-Export${ext}`,
    filters: [{ name: name, extensions: [ext] }]
  }, function (filename) {
    if (!filename) return
    var presets = userConfig.getSettings('presets') || {}
    app.mapeo.exportData(filename, {format, presets}, function (err) {
      if (err) dialog.showErrorBox('Error', i18n('menu-export-data-error') + err)
      dialog.showMessageBox({
        message: i18n('menu-export-data-success'),
        buttons: ['OK']
      })
    })
  })
}
