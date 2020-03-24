const { dialog, app, Menu } = require('electron')

const userConfig = require('./user-config')
const i18n = require('./i18n')
const logger = require('../logger')
const t = i18n.t

module.exports = async function createMenu (ipc) {
  await app.whenReady()

  function setMenu () {
    var menu = Menu.buildFromTemplate(menuTemplate(ipc))
    Menu.setApplicationMenu(menu)
  }

  setMenu()
  // Re-add the menu every time the locale changes
  i18n.on('locale-change', () => setMenu())
}

function menuTemplate (ipc) {
  var template = [
    {
      label: t('menu-file'),
      submenu: [
        {
          label: t('menu-import-tiles'),
          click: function (item, focusedWindow) {
            var opts = {
              title: t('menu-import-tiles'),
              properties: ['openFile'],
              filters: [
                { name: 'Tar', extensions: ['tar'] }
              ]
            }
            dialog.showOpenDialog(opts, function (filenames) {
              if (!filenames || !filenames.length) return
              ipc.send('import-tiles', filenames[0], cb)
              function cb (err) {
                if (err) {
                  logger.error('[IMPORT TILES] error', err)
                  dialog.showErrorBox(
                    t('menu-import-tiles-error'),
                    t('menu-import-tiles-error-known') + ': ' + err
                  )
                } else {
                  logger.log('[IMPORT TILES] success')
                  dialog.showMessageBox({
                    message: t('menu-import-data-success'),
                    buttons: ['OK']
                  })
                }
              }
            })
          }
        },
        {
          label: t('menu-import-configuration'),
          click: function (item, focusedWindow) {
            dialog.showOpenDialog(
              {
                title: t('menu-import-configuration-dialog'),
                filters: [
                  { name: 'Mapeo Settings', extensions: ['mapeosettings'] }
                ],
                properties: ['openFile']
              },
              function (filenames) {
                if (!filenames || !filenames.length) return
                userConfig.importSettings(focusedWindow, filenames[0], onError)
                function onError (err) {
                  if (!err) return
                  dialog.showErrorBox(
                    t('menu-import-configuration-error'),
                    t('menu-import-configuration-error-known') + ': ' + err
                  )
                }
              }
            )
          }
        },
        {
          label: t('menu-import-data'),
          click: function (item, focusedWindow) {
            // TODO: handle multiple files
            dialog.showOpenDialog(
              {
                title: t('menu-import-data-dialog'),
                filters: [
                  { name: 'GeoJSON', extensions: ['geojson'] },
                  { name: 'Shape', extensions: ['shp'] }
                ],
                properties: ['openFile']
              },
              function (filenames) {
                if (!filenames || !filenames.length) return
                var filename = filenames[0]
                logger.log('[IMPORTING]', filename)
                ipc.send('import-data', filename)
              }
            )
          },
          visible: true
        }
      ]
    },
    {
      label: t('menu-edit'),
      submenu: [
        {
          label: t('menu-undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
          visible: false
        },
        {
          label: t('menu-redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
          visible: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu-cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: t('menu-copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: t('menu-paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: t('menu-selectall'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: t('menu-visualization'),
      submenu: [
        {
          label: t('menu-change-language'),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('change-language-request')
            }
          }
        },
        {
          label: t('menu-visualization-reload'),
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          },
          visible: true
        },
        {
          label: t('menu-visualization-fullscreen'),
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
          label: t('menu-visualization-devtools'),
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
          label: t('menu-zoom-to-data'),
          click: function (item, focusedWindow) {
            ipc.send('zoom-to-data-get-centroid', 'node', function (_, loc) {
              logger.log('RESPONSE(menu,getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-node', loc)
            })
            ipc.send('zoom-to-data-get-centroid', 'observation', function (_, loc) {
              logger.log('RESPONSE(menu,getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-observation', loc)
            })
          },
          visible: true
        },
        {
          label: t('menu-zoom-to-latlon'),
          click: function (item, focusedWindow) {
            focusedWindow.webContents.send('open-latlon-dialog')
          },
          visible: true
        }
      ]
    },
    {
      label: t('menu-window'),
      role: 'window',
      submenu: [
        {
          label: t('menu-minimize'),
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: t('menu-close'),
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: t('menu-help'),
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
          label: t('menu-about') + ' ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: t('menu-services'),
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: t('menu-hide') + ' ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: t('menu-hide-others'),
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: t('menu-show-all'),
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: t('menu-quit') + ' ' + name,
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
        label: t('menu-bring-to-front'),
        role: 'front'
      }
    )
  }

  return template
}
