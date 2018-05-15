var path = require('path')
var dialog = require('electron').dialog
var electron = require('electron')

var userConfig = require('./lib/user-config')
var exportData = require('./lib/export-data')
var i18n = require('./lib/i18n')

module.exports = function (app) {
  var template = [
    {
      label: i18n('menu-file'),
      submenu: [
        {
          label: i18n('menu-import-tiles'),
          click: function (item, focusedWindow) {
            dialog.showOpenDialog({
              title: i18n('menu-import-tiles'),
              filters: [{name: 'Offline Maps'}],
              properties: ['openFile', 'openDirectory']
            }, function (filenames) {
              if (!filenames) return
              app.tiles.go(filenames[0], cb)
              function cb (err) {
                if (err) {
                  dialog.showErrorBox(
                    i18n('menu-import-tiles-error'),
                    i18n('menu-import-tiles-error-known') + ': ' + err
                  )
                } else {
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
            dialog.showOpenDialog({
              title: i18n('menu-import-configuration-dialog'),
              filters: [{name: 'Mapeo Settings', extensions: ['mapeosettings']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              userConfig.importSettings(focusedWindow, filenames[0], onError)
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  i18n('menu-import-configuration-error'),
                  i18n('menu-import-configuration-error-known') + ': ' + err
                )
              }
            })
          }
        },
        {
          label: i18n('menu-import-data'),
          click: function (item, focusedWindow) {
            // TODO: handle multiple files
            dialog.showOpenDialog({
              title: i18n('menu-import-data-dialog'),
              filters: [{name: 'GeoJSON', extensions: ['geojson']}, {name: 'Shape', extensions: ['shp']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              var pending = filenames.length
              var filename = filenames[0]
              var ex = app.importer.importFromFile(filename, function (err) {
                if (err) {
                  dialog.showErrorBox('Error', i18n('menu-import-data-error') + err)
                } else {
                  dialog.showMessageBox({
                    message: i18n('menu-import-data-success'),
                    buttons: ['OK']
                  })
                }
              })
            })
          },
          visible: true
        },
        {
          label: i18n('menu-export-data'),
          submenu: [
            {
              label: i18n('menu-export-geojson'),
              click: exportDataMenu(app, 'GeoJSON', 'geojson')
            },
            {
              label: i18n('menu-export-shapefile'),
              click: exportDataMenu(app, 'Shapefile', 'shp')
            }
          ],
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
            focusedWindow.webContents.send('zoom-to-data-request')
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
      submenu: [
      ]
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
          click: function () { app.quit() }
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

function exportDataMenu (app, name, ext) {
  return function (item, focusedWindow) {
    dialog.showSaveDialog({
      title: i18n('menu-export-data-dialog'),
      defaultPath: `export.${ext}`,
      filters: [{name: name, extensions: [ext]}]
    }, function (filename) {
      if (!filename) return
      exportData(app.osm, filename, function (err) {
        if (err) dialog.showErrorBox('Error', i18n('menu-export-data-error') + err)
      })
    })
  }
}
