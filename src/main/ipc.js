var path = require('path')
var { dialog, app, ipcMain } = require('electron')

var locale = require('./locale')
var i18n = require('../i18n')

var userConfig = require('./user-config')
var exportData = require('./export-data')
var logger = require('../log')

module.exports = function (win) {
  var log = logger.Node()
  var ipc = ipcMain

  ipc.on('get-user-data', function (event, type) {
    var data = userConfig.getSettings(type)
    if (!data) console.warn('unhandled event', type)
    event.returnValue = data
  })

  ipc.on('error', function (ev, message) {
    win.webContents.send('error', message)
  })

  ipc.on('set-locale', function (ev, lang) {
    app.translations = locale.load(lang)
  })

  ipc.on('import-example-presets', function (ev) {
    var filename = path.join(
      __dirname,
      '..',
      '..',
      'static',
      'settings-jungle-v1.0.0.mapeosettings'
    )
    userConfig.importSettings(win, filename, function (err) {
      if (err) return log(err)
      log('Example presets imported from ' + filename)
    })
  })

  ipc.on('import-settings', function (ev, filename) {
    userConfig.importSettings(win, filename, function (err) {
      if (err) return log(err)
      log('Example presets imported from ' + filename)
    })
  })

  ipc.on('save-file', function () {
    var metadata = userConfig.getSettings('metadata')
    var ext = metadata ? metadata.dataset_id : 'mapeodata'
    dialog.showSaveDialog(
      {
        title: i18n('save-db-dialog'),
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
        title: i18n('open-db-dialog'),
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

  ipc.on('export-data', function (_, name, format) {
    exportData(app, name, format)
  })

  ipc.on('zoom-to-data-get-centroid', function (_, type) {
    getDatasetCentroid(type, function (_, loc) {
      log('RESPONSE(getDatasetCentroid):', loc)
      if (!loc) return
      win.webContents.send('zoom-to-data-response', loc)
    })
  })

  ipc.on('zoom-to-latlon-request', function (_, lon, lat) {
    win.webContents.send('zoom-to-latlon-response', [lon, lat])
  })

  ipc.on('force-refresh-window', function () {
    win.webContents.send('force-refresh-window')
  })

  ipc.on('refresh-window', function () {
    win.webContents.send('refresh-window')
  })

  var importer = app.mapeo.importer

  importer.on('error', function (err, filename) {
    win.webContents.send('import-error', err.toString())
  })

  importer.on('complete', function (filename) {
    win.webContents.send('import-complete', path.basename(filename))
  })

  importer.on('progress', function (filename, index, total) {
    win.webContents.send(
      'import-progress',
      path.basename(filename),
      index,
      total
    )
  })

  function getDatasetCentroid (type, done) {
    log('STATUS(getDatasetCentroid):', type)
    app.osm.core.api.stats.getMapCenter(type, function (err, center) {
      if (err) return log('ERROR(getDatasetCentroid):', err)
      if (!center) return done(null, null)
      done(null, [center.lon, center.lat])
    })
  }
}
