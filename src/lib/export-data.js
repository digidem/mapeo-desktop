var dialog = require('electron').dialog
var path = require('path')
var pump = require('pump')
var fs = require('fs')

var exportGeoJson = require('./export-geojson')
var exportShapefile = require('./export-shapefile')
var i18n = require('./i18n')

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
  var ext = path.extname(filename)
  switch (ext) {
    case '.geojson': return pump(exportGeoJson(mapeo.api.osm), fs.createWriteStream(filename), done)
    case '.shp': return exportShapefile(mapeo.api.osm, filename, done)
    case '.mapeodata': return exportSyncfile(mapeo.api.sync, filename, done)
    default: return done(new Error('Extension not supported'))
  }
}

function exportSyncfile (sync, filename, done) {
  var progress = sync.replicateFromFile(filename)
  progress.on('error', done)
  progress.on('end', done)
}
