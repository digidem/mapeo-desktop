var fs = require('fs')
var pump = require('pump')
var dialog = require('electron').dialog
var userConfig = require('./user-config')
var exportGeoJson = require('./export-geojson')

module.exports = function (app) {
  var template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Importar Configuración...',
          click: function (item, focusedWindow) {
            dialog.showOpenDialog({
              title: 'Selecionar archivo de configuración',
              filters: [{name: 'Mapeo Settings', extensions: ['mapeosettings']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              userConfig.importSettings(focusedWindow, filenames[0], onError)
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  'No pudo importar configuración',
                  'No pudo importar configuración por un error: ' + err
                )
              }
            })
          }
        },
        {
          label: 'Export as GeoJSON..',
          click: function (item, focusedWindow) {
            dialog.showSaveDialog({
              title: 'Guardar como..',
              defaultPath: 'export.geojson_layers',
              filters: [{name: 'GeoJSON', extensions: ['geojson_layers']}]
            }, function (root) {
              if (!root) return
              var bbox = [-Infinity, -Infinity, Infinity, Infinity]
              var ex = exportGeoJson(app.osm, {bbox: bbox})
              collect(ex, function (err, data) {
                if (err) return showFailure(err)

                var layers = clone(focusedWindow.layers || {})

                var otherFilter = ['none']
                Object.keys(layers).forEach(function (name) {
                  otherFilter.push(layers[name])
                })

                layers.other = otherFilter

                mkdirp.sync(root)

                var geojson = JSON.parse(data)
                for (var name in layers) {
                  var layer = fc(geojson.features.filter(ff(layers[name])))
                  var json = JSON.stringify(layer, null, 4)
                  fs.writeFileSync(path.join(root, name + '.geojson'), json)
                }

                showSuccess()
              })

              function showSuccess () {
                dialog.showMessageBox({
                  message: 'Exportación completa!',
                  buttons: ['OK']
                })
              }
              function showFailure (err) {
                dialog.showErrorBox('Error', 'Error al exportar' + err)
              }
            })
          },
          visible: true
        }
      ]
    },
    {
      label: 'Edición',
      submenu: [
        {
          label: 'Deshacer',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
          visible: false
        },
        {
          label: 'Rehacer',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
          visible: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Cortar',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Pegar',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Seleccionar todo',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'Visualización',
      submenu: [
        {
          label: 'Volver a cargar página',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          },
          visible: false
        },
        {
          label: 'Usar pantalla completa',
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
          label: 'Abrir herramientas de desarrollo',
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
          label: 'Zoom a los datos',
          click: function (item, focusedWindow) {
            focusedWindow.webContents.send('zoom-to-data-request')
          },
          visible: true
        }
      ]
    },
    {
      label: 'Ventana',
      role: 'window',
      submenu: [
        {
          label: 'Minimizar',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Cerrar',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Ayuda',
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
          label: 'Acerca de ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Servicios',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Ocultar ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Ocultar otros',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Mostrar todo',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Salir de ' + name,
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
        label: 'Traer todo al frente',
        role: 'front'
      }
    )
  }
  return template
}
