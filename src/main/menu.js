var { dialog, app } = require('electron')

var debug = require('debug')('mapeo-desktop')
var userConfig = require('./user-config')
var i18n = require('../i18n')
var logger = require('../log')
var log

module.exports = function (app) {
  log = logger.Node()
  var template = [
    {
      label: i18n('menu-file'),
      submenu: [
        {
          label: i18n('menu-import-tiles'),
          click: function (item, focusedWindow) {
            var opts = {
              title: i18n('menu-import-tiles'),
              properties: ['openFile'],
              filters: [
                { name: 'Electron Asar', extensions: ['asar'] },
                { name: 'Tar', extensions: ['tar'] }
              ]
            }
            dialog.showOpenDialog(opts, function (filenames) {
              if (!filenames) return
              app.tiles.go(filenames[0], cb)
              function cb (err) {
                if (err) {
                  log('[IMPORT TILES] error', err)
                  dialog.showErrorBox(
                    i18n('menu-import-tiles-error'),
                    i18n('menu-import-tiles-error-known') + ': ' + err
                  )
                } else {
                  log('[IMPORT TILES] success')
                  dialog.showMessageBox({
                    message: i18n('menu-import-data-success'),
                    buttons: ['OK']
                  })
                }
              }
            })
          }
        },
        {
          label: i18n('menu-import-configuration'),
          click: function (item, focusedWindow) {
            dialog.showOpenDialog(
              {
                title: i18n('menu-import-configuration-dialog'),
                filters: [
                  { name: 'Mapeo Settings', extensions: ['mapeosettings'] }
                ],
                properties: ['openFile']
              },
              function (filenames) {
                if (!filenames) return
                userConfig.importSettings(focusedWindow, filenames[0], onError)
                function onError (err) {
                  if (!err) return
                  dialog.showErrorBox(
                    i18n('menu-import-configuration-error'),
                    i18n('menu-import-configuration-error-known') + ': ' + err
                  )
                }
              }
            )
          }
        },
        {
          label: i18n('menu-import-data'),
          click: function (item, focusedWindow) {
            // TODO: handle multiple files
            dialog.showOpenDialog(
              {
                title: i18n('menu-import-data-dialog'),
                filters: [
                  { name: 'GeoJSON', extensions: ['geojson'] },
                  { name: 'Shape', extensions: ['shp'] }
                ],
                properties: ['openFile']
              },
              function (filenames) {
                if (!filenames) return
                var filename = filenames[0]
                debug('[IMPORTING]', filename)
                app.mapeo.importer.importFromFile(filename)
              }
            )
          },
          visible: true
        }
      ]
    },
    {
      label: i18n('menu-edit'),
      submenu: [
        {
          label: i18n('undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
          visible: false
        },
        {
          label: i18n('redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
          visible: false
        },
        {
          type: 'separator'
        },
        {
          label: i18n('cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: i18n('copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: i18n('paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: i18n('selectall'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: i18n('menu-visualization'),
      submenu: [
        {
          label: i18n('menu-change-language'),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('change-language-request')
            }
          }
        },
        {
          label: i18n('menu-visualization-reload'),
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          },
          visible: false
        },
        {
          label: i18n('menu-visualization-fullscreen'),
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Ctrl+Command+F'
            } else {
              return 'F11'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        },
        {
          label: i18n('menu-visualization-devtools'),
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Alt+Command+I'
            } else {
              return 'Ctrl+Shift+I'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.toggleDevTools()
            }
          },
          visible: true
        },
        {
          label: i18n('menu-zoom-to-data'),
          click: function (item, focusedWindow) {
            getDatasetCentroid('node', function (_, loc) {
              log('RESPONSE(getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-response', loc)
            })
            getDatasetCentroid('observation', function (_, loc) {
              log('RESPONSE(getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-response', loc)
            })
          },
          visible: true
        },
        {
          label: i18n('menu-zoom-to-latlon'),
          click: function (item, focusedWindow) {
            focusedWindow.webContents.send('open-latlon-dialog')
          },
          visible: true
        }
      ]
    },
    {
      label: i18n('menu-window'),
      role: 'window',
      submenu: [
        {
          label: i18n('menu-minimize'),
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: i18n('menu-close'),
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: i18n('menu-help'),
      role: 'help',
      submenu: []
    }
  ]

  if (process.platform === 'darwin') {
    var name = require('electron').app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          label: i18n('menu-about') + ' ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: i18n('menu-services'),
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: i18n('menu-hide') + ' ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: i18n('menu-hide-others'),
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: i18n('menu-show-all'),
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: i18n('menu-quit') + ' ' + name,
          accelerator: 'Command+Q',
          click: function () {
            app.quit()
          }
        }
      ]
    })
    // Window menu.
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: i18n('menu-bring-to-front'),
        role: 'front'
      }
    )
  }
  return template
}

function getDatasetCentroid (type, done) {
  log('STATUS(getDatasetCentroid):', type)
  app.osm.core.api.stats.getMapCenter(type, function (err, center) {
    if (err) return log('ERROR(getDatasetCentroid):', err)
    if (!center) return done(null, null)
    done(null, [center.lon, center.lat])
  })
}
