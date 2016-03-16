var fs = require('fs')
var dialog = require('electron').dialog
var userConfig = require('./user-config')

module.exports = function (app) {
  var template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Importar Tipos...',
          click: function (item, focusedWindow) {
            dialog.showOpenDialog({
              title: 'Selecionar archivo de tipos',
              filters: [{name: 'JSON', extensions: ['json']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              fs.readFile(filenames[0], 'utf8', function (err, data) {
                if (err) return onError(err)
                userConfig.setPresets(focusedWindow, data, onError)
              })
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  'No pudo importar tipos',
                  'No pudo importar tipos por un error: ' + err
                )
              }
            })
          }
        },
        {
          label: 'Importar CSS...',
          click: function (item, focusedWindow) {
            dialog.showOpenDialog({
              title: 'Selecionar archivo de CSS',
              filters: [{name: 'css', extensions: ['css']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              fs.readFile(filenames[0], 'utf8', function (err, data) {
                if (err) return onError(err)
                userConfig.setCustomCss(focusedWindow, data, onError)
              })
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  'No pudo importar css',
                  'No pudo importar css por un error: ' + err
                )
              }
            })
          }
        },
        {
          label: 'Importar Imagery...',
          click: function (item, focusedWindow) {
            dialog.showOpenDialog(focusedWindow, {
              title: 'Selecionar archivo de Imagery',
              filters: [{name: 'JSON', extensions: ['json']}],
              properties: ['openFile']
            }, function (filenames) {
              if (!filenames) return
              fs.readFile(filenames[0], 'utf8', function (err, data) {
                if (err) return onError(err)
                userConfig.setImagery(focusedWindow, data, onError)
              })
              function onError (err) {
                if (!err) return
                dialog.showErrorBox(
                  'No pudo importar imagery',
                  'No pudo importar imagery por un error: ' + err
                )
              }
            })
          }
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
