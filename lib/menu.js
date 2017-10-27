var fs = require('fs')
var pump = require('pump')
var dialog = require('electron').dialog
var userConfig = require('./user-config')
var exportGeoJson = require('./export-geojson')
var i18n = require('./i18n')
var electron = require('electron')

module.exports = function (app) {
  var template = [
    {
      label: i18n('menu-file'),
      submenu: [
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
          label: i18n('menu-export-geojson'),
          click: function (item, focusedWindow) {
            dialog.showSaveDialog({
              title: i18n('menu-export-geojson-dialog'),
              defaultPath: 'export.geojson',
              filters: [{name: 'GeoJSON', extensions: ['geojson']}]
            }, function (filename) {
              if (!filename) return
              var bbox = [[-Infinity, Infinity], [-Infinity, Infinity]]
              var out = fs.createWriteStream(filename)
              var ex = exportGeoJson(app.osm, bbox)
              pump(ex, out, function (err) {
                if (err) {
                  dialog.showErrorBox('Error', i18n('menu-export-geojson-error') + err)
                } else {
                  dialog.showMessageBox({
                    message: i18n('menu-export-geojson-success'),
                    buttons: ['OK']
                  })
                }
              })
            })
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
            var win = createLatLonDialogWindow()
            electron.ipcMain.once('close-latlon-dialog', function () {
              if (win) win.close()
            })
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

function createLatLonDialogWindow () {
  var INDEX = 'file://' + require('path').resolve(__dirname, '../browser/latlon_dialog.html')
  var winOpts = {
    width: 300,
    height: 200,
    modal: true,
    show: false,
    alwaysOnTop: true
  }
  var win = new electron.BrowserWindow(winOpts)
  win.once('ready-to-show', function () {
    win.setMenu(null)
    win.show()
  })
  win.loadURL(INDEX)
  return win
}
