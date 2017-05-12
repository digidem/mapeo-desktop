#!/usr/bin/env electron

var fs = require('fs')
var http = require('http')
var path = require('path')
var electron = require('electron')
var Config = require('electron-config')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.
var ecstatic = require('ecstatic')
var mkdirp = require('mkdirp')

require('electron-debug')()

var tileserver = require('./lib/tileserver')
var createMediaServer = require('./lib/media_server')
var config = require('./config')
var Api = require('./lib/api')

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = path.join(app.getPath('userData'), 'org.digital-democracy.MapFilter')
mkdirp.sync(userDataPath)

var appConfig = new Config()

app.on('ready', onAppReady)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

var dbPath = path.join(userDataPath, 'db')
var api = new Api(dbPath)
var mediaServer = createMediaServer(api.archive, '/media')
http
  .createServer(function (req, res) {
    console.log('request to media server')
    mediaServer(req, res, function (err) {
      if (err) {
        console.error(err)
        res.statusCode = 404
        res.end()
      }
    })
  })
  .listen(config.servers.observations.port)

http
  .createServer(ecstatic({root: path.join(__dirname, 'static')}))
  .listen(config.servers.static.port)

module.exports.api = api

function onAppReady () {
  BrowserWindow.addDevToolsExtension('/Users/Gregor/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/2.1.9_0')
  BrowserWindow.addDevToolsExtension('/Users/Gregor/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.1_0')

  var win = setupWindow()

  win.on('closed', function () {
    win = null
  })

  setupMenu()

  setupFileIPCs(win, electron.ipcMain, win.webContents)

  if (fs.existsSync(path.join(userDataPath, 'mapfilter.mbtiles'))) {
    // workaround for pathnames containing spaces
    setupTileServer({
      protocol: 'mbtiles:',
      pathname: path.join(userDataPath, 'mapfilter.mbtiles')
    })
  }

  function setupWindow () {
    var indexHtml = 'file://' + path.resolve(__dirname, './index.html')
    var win = createWindow(indexHtml)

    win.on('close', () => appConfig.set('winBounds', win.getBounds()))

    return win
  }

  function setupMenu () {
    var template = require('./lib/menu')(app)
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  function setupTileServer (tileUri) {
    console.log(tileUri, config.servers.tiles.port)
    tileserver(tileUri).listen(config.servers.tiles.port)
  }
}

function createWindow (indexFile) {
  var opts = Object.assign({}, appConfig.get('winBounds'), {
    show: false,
    title: app.getName()
  })
  var win = new BrowserWindow(opts)
  win.once('ready-to-show', () => win.show())
  win.loadURL(indexFile)

  return win
}

function setupFileIPCs (window, incomingChannel, outgoingChannel) {
  incomingChannel.on('save-file', onSaveFile)
  incomingChannel.on('open-file', onOpenFile)
  incomingChannel.on('replicate-usb', onReplicateUsb)

  function onSaveFile () {
    var ext = 'mapfilter'
    electron.dialog.showSaveDialog(window, {
      title: 'Crear nuevo base de datos para sincronizar',
      defaultPath: 'base-de-datos.' + ext,
      filters: [
        { name: 'Mapfilter Data (*.' + ext + ')', extensions: [ext] }
      ]
    }, onSave)

    function onSave (filename) {
      if (typeof filename === 'undefined') return

      outgoingChannel.send('select-file', filename)
    }
  }

  function onOpenFile () {
    var ext = 'mapfilter'
    electron.dialog.showOpenDialog(window, {
      title: 'Seleccionar base de datos para sincronizar',
      properties: [ 'openFile' ],
      filters: [
        { name: 'Mapfilter Data (*.' + ext + ')', extensions: [ext] }
      ]
    }, onOpen)

    function onOpen (filenames) {
      if (typeof filenames === 'undefined') return
      if (filenames.length !== 1) return

      var filename = filenames[0]
      outgoingChannel.send('select-file', filename)
    }
  }

  function onReplicateUsb () {
    var win = new BrowserWindow({
      show: false,
      title: app.getName() + ' - ' + 'Sincronización'
    })
    win.once('ready-to-show', () => win.show())
    win.loadURL('file://' + path.resolve(__dirname, 'replicate_usb.html'))
  }
}

