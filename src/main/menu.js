const { defineMessages } = require('react-intl')
const { dialog, app, Menu } = require('electron')

const userConfig = require('./user-config')
const i18n = require('./i18n')
const logger = require('electron-timber')
const t = i18n.t

const m = defineMessages({
  'menu-file': 'File',
  'menu-change-language': 'Change language...',
  'menu-change-language-title': "Enter the language (e.g., 'en' or 'es')",
  'menu-import-tiles-file': 'File (.asar, .tar)',
  'menu-import-tiles-directory': 'Directory of tiles',
  'menu-import-tiles': 'Import Offline Map Tiles...',
  'menu-import-tiles-error': 'Could not import tiles',
  'menu-import-tiles-error-known': 'Could not import tiles because of an error',
  'menu-import-configuration': 'Import Configuration...',
  'menu-import-configuration-title': 'Select configuration file',
  'menu-import-configuration-error': 'Could not import configuration',
  'menu-import-configuration-error-known':
    'Could not import configuration because of an error',
  'menu-export-data': 'Export',
  'menu-export-sync': 'Mapeo Sync (.mapeodata)',
  'menu-export-geojson': 'GeoJSON (.geojson)',
  'menu-export-shapefile': 'Shapefile (.shp, .dbf)',
  'menu-export-data-dialog': 'Save as...',
  'menu-export-data-error': 'Error on export',
  'menu-export-data-success': 'Export complete!',
  'menu-visualization': 'Visualization',
  'menu-visualization-reload': 'Reload page',
  'menu-visualization-fullscreen': 'Go to Fullscreen',
  'menu-visualization-devtools': 'Open developer tools',
  'menu-zoom-to-data': 'Zoom to data',
  'menu-zoom-to-latlon': 'Zoom to Coordinates..',
  'menu-window': 'Window',
  'menu-help': 'Help',
  'menu-about': 'About',
  'menu-services': 'Services',
  'menu-hide': 'Hide',
  'menu-show-all': 'Show all',
  'menu-hide-others': 'Hide others',
  'menu-quit': 'Quit',
  'menu-bring-to-front': 'Bring all to the front',
  'menu-minimize': 'Minimize',
  'menu-close': 'Close',
  'menu-edit': 'Edit',
  'menu-undo': 'Undo',
  'menu-redo': 'Redo',
  'menu-cut': 'Cut',
  'menu-copy': 'Copy',
  'menu-paste': 'Paste',
  'menu-selectall': 'Select all',
  'menu-import-data': 'Import data...',
  'menu-import-data-dialog': 'Choose a file to import...',
  'menu-import-data-success': 'Import complete!',
  'menu-import-data-error': 'Error on import'
})

module.exports = async function createMenu (context) {
  await app.whenReady()

  function setMenu () {
    var menu = Menu.buildFromTemplate(menuTemplate(context))
    Menu.setApplicationMenu(menu)
  }

  setMenu()
  // Re-add the menu every time the locale changes
  i18n.on('locale-change', () => setMenu())
}

function menuTemplate (context) {
  var template = [
    {
      label: t(m['menu-file']),
      submenu: [
        {
          label: t(m['menu-import-tiles']),
          click: function (item, focusedWindow) {
            var opts = {
              title: t(m['menu-import-tiles']),
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
                  logger.error('[IMPORT TILES] error', err)
                  dialog.showErrorBox(
                    t(m['menu-import-tiles-error']),
                    t(m['menu-import-tiles-error-known']) + ': ' + err
                  )
                } else {
                  logger.log('[IMPORT TILES] success')
                  dialog.showMessageBox({
                    message: t(m['menu-import-data-success']),
                    buttons: ['OK']
                  })
                }
              }
            })
          }
        },
        {
          label: t(m['menu-import-configuration']),
          click: function (item, focusedWindow) {
            dialog.showOpenDialog(
              {
                title: t(m['menu-import-configuration-dialog']),
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
                    t(m['menu-import-configuration-error']),
                    t(m['menu-import-configuration-error-known']) + ': ' + err
                  )
                }
              }
            )
          }
        },
        {
          label: t(m['menu-import-data']),
          click: function (item, focusedWindow) {
            // TODO: handle multiple files
            dialog.showOpenDialog(
              {
                title: t(m['menu-import-data-dialog']),
                filters: [
                  { name: 'GeoJSON', extensions: ['geojson'] },
                  { name: 'Shape', extensions: ['shp'] }
                ],
                properties: ['openFile']
              },
              function (filenames) {
                if (!filenames) return
                var filename = filenames[0]
                logger.log('[IMPORTING]', filename)
                app.mapeo.importer.importFromFile(filename)
              }
            )
          },
          visible: true
        }
      ]
    },
    {
      label: t(m['menu-edit']),
      submenu: [
        {
          label: t('undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
          visible: false
        },
        {
          label: t('redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
          visible: false
        },
        {
          type: 'separator'
        },
        {
          label: t('cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: t('copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: t('paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: t('selectall'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: t(m['menu-visualization']),
      submenu: [
        {
          label: t(m['menu-change-language']),
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('change-language-request')
            }
          }
        },
        {
          label: t(m['menu-visualization-reload']),
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          },
          visible: false
        },
        {
          label: t(m['menu-visualization-fullscreen']),
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
          label: t(m['menu-visualization-devtools']),
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
          label: t(m['menu-zoom-to-data']),
          click: function (item, focusedWindow) {
            getDatasetCentroid('node', function (_, loc) {
              logger.log('RESPONSE(getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-response', loc)
            })
            getDatasetCentroid('observation', function (_, loc) {
              logger.log('RESPONSE(getDatasetCentroid):', loc)
              if (!loc) return
              focusedWindow.webContents.send('zoom-to-data-response', loc)
            })
          },
          visible: true
        },
        {
          label: t(m['menu-zoom-to-latlon']),
          click: function (item, focusedWindow) {
            focusedWindow.webContents.send('open-latlon-dialog')
          },
          visible: true
        }
      ]
    },
    {
      label: t(m['menu-window']),
      role: 'window',
      submenu: [
        {
          label: t(m['menu-minimize']),
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: t(m['menu-close']),
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: t(m['menu-help']),
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
          label: t(m['menu-about']) + ' ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: t(m['menu-services']),
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: t(m['menu-hide']) + ' ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: t(m['menu-hide-others']),
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: t(m['menu-show-all']),
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: t(m['menu-quit']) + ' ' + name,
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
        label: t(m['menu-bring-to-front']),
        role: 'front'
      }
    )
  }

  return template
}

function getDatasetCentroid (type, done) {
  logger.log('STATUS(getDatasetCentroid):', type)
  app.osm.core.api.stats.getMapCenter(type, function (err, center) {
    if (err) return logger.error('ERROR(getDatasetCentroid):', err)
    if (!center) return done(null, null)
    done(null, [center.lon, center.lat])
  })
}
