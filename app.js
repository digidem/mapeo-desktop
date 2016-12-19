#!/usr/bin/env electron

var http = require('http')
var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
var Config = require('electron-config')
var server = require('./server')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.
var config = require('./config')

var ecstatic = require('ecstatic')
var JSONStream = require('JSONStream')
var observationServer = require('ddem-observation-server')
var websocket = require('websocket-stream')

require('electron-debug')()

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')
var appConfig = new Config()

function parseArguments (args) {
  return minimist(args, {
    default: {
      datadir: path.join(userDataPath, 'data')
    },
    boolean: [ 'headless', 'debug' ],
    alias: {
      d: 'debug'
    }
  })
}

function start (argv) {
  if (!argv.headless) {
    app.on('ready', onAppReady)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }
}

function onAppReady () {
  var win = setupWindow()

  setupMenu()

  setupFileIPCs(win, electron.ipcMain, win.webContents)

  var obs = setupObservations()

  var obss = setupObservationsServer(obs)
  setupServer(obs)
  setupObservationWebsocket(obss, obs)

  setupStaticServer()

  function setupWindow () {
    var indexHtml = 'file://' + path.resolve(__dirname, './index.html')
    var win = createWindow(indexHtml)

    win.on('close', () => appConfig.set('winBounds', win.getBounds()))

    win.on('closed', function () {
      win = null
    })

    return win
  }

  function setupMenu () {
    var template = require('./lib/menu')(app)
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  function setupServer (osm) {
    var nodeServer = server(osm)
    nodeServer.listen(config.servers.http.port)
  }

  function setupObservations () {
    return observationServer(path.join(app.getPath('userData'), 'org.digital-democracy.MapFilter'))
  }

  function setupObservationsServer (obs) {
    var server = http.createServer(obs)
    server.listen(config.servers.observations.port)
    return server
  }

  function setupObservationWebsocket (server, obs) {
    websocket.createServer({ server: server }, function (stream) {
      obs.log.createReadStream({ live: true }).pipe(JSONStream.stringify()).pipe(stream)
    })
  }

  function setupStaticServer () {
    http.createServer(ecstatic({root: path.join(__dirname, 'static')})).listen(config.servers.static.port)
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
}

var argv = parseArguments(process.argv.slice(2))
start(argv)
