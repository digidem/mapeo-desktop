var dialog = require('electron').dialog

var userConfig = require('./user-config')
var { t } = require('./i18n')

module.exports = openDialog

function openDialog (app, name, format) {
  var ext = format === 'shapefile' ? 'zip' : format
  dialog.showSaveDialog(
    {
      title: t('menu-export-data-dialog'),
      defaultPath: `Mapeo-Export${ext}`,
      filters: [{ name: name, extensions: [ext] }]
    },
    function (filename) {
      if (!filename) return
      var presets = userConfig.getSettings('presets') || {}
      app.mapeo.exportData(filename, { format, presets }, function (err) {
        if (err) {
          dialog.showErrorBox('Error', t('menu-export-data-error') + err)
        }
        dialog.showMessageBox({
          message: t('menu-export-data-success'),
          buttons: ['OK']
        })
      })
    }
  )
}
