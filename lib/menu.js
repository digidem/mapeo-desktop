var fs = require('fs')
var pump = require('pump')
var dialog = require('electron').dialog
var userConfig = require('./user-config')
var exportGeoJson = require('./export-geojson')

module.exports = function (app) {
  var template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import configuration…',
          click: function (item, focusedWindow) {
            dialog.showOpenDialog({
              title: 'Select configuration file',
              filters: [{name: 'Mapeo Settings', extensions: ['mapeosettings']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              userConfig.importSettings(focusedWindow, filenames[0], onError)
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  'Could not import configuration',
                  'Could not import configuration because of an error: ' + err
                )
              }
            })
          }
        },
        {
          label: 'Export as GeoJSON…',
          click: function (item, focusedWindow) {
            dialog.showSaveDialog({
              title: 'Save as…',
              defaultPath: 'export.geojson',
              filters: [{name: 'GeoJSON', extensions: ['geojson']}]
            }, function (filename) {
              if (!filename) return
              var bbox = [[-Infinity, Infinity], [-Infinity, Infinity]]
              var out = fs.createWriteStream(filename)
              var ex = exportGeoJson(app.osm, bbox)
              pump(ex, out, function (err) {
                if (err) {
                  dialog.showErrorBox('Error', 'Error on export' + err)
                } else {
                  dialog.showMessageBox({
                    message: 'Export complete!',
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
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
          visible: false
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
          visible: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'Visualization',
      submenu: [
        {
          label: 'Reload page',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          },
          visible: false
        },
        {
          label: 'Use fullscreen',
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
          label: 'Open developer tools',
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
          label: 'Zoom to data',
          click: function (item, focusedWindow) {
            focusedWindow.webContents.send('zoom-to-data-request')
          },
          visible: true
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
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
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Unhide all',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Leave ' + name,
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
        label: 'Bring all to the front',
        role: 'front'
      }
    )
  }
  return template
}
