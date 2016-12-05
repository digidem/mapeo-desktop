#!/usr/bin/env electron

var path = require('path')
var minimist = require('minimist')
var electron = require('electron')
var server = require('./server')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.
var config = require('./config')

var osmdb = require('osm-p2p')
var obsdb = require('osm-p2p-observations')
var level = require('level')

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(':memory:')

function testSqlite3 (win) {
  console.log('foo 1')
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('print-crap', 'hello warld')
    console.log('foo 2')
  })
  db.serialize(function () {
    db.run('CREATE TABLE lorem (info TEXT)')

    var stmt = db.prepare('INSERT INTO lorem VALUES (?)')
    for (var i = 0; i < 10; i++) {
      stmt.run('Ipsum ' + i)
    }
    stmt.finalize()

    db.each('SELECT rowid AS id, info FROM lorem', function (err, row) {
      if (err) return console.error(err)
      console.log(row.id + ': ' + row.info)
      win.webContents.send('print-crap', row.id + ': ' + row.info)
    })
  })
}

// db.close();

require('electron-debug')({showDevTools: true})

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

function parseArguments (args) {
  return minimist(args, {
    default: {
      port: 5000,
      datadir: path.join(userDataPath, 'data')
    },
    boolean: [ 'headless', 'debug' ],
    alias: {
      p: 'port',
      d: 'debug'
    }
  })
}

function start (argv) {
  if (!argv.headless) {
    app.on('ready', onAppReady)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      app.quit()
    })
  }
}

function onAppReady () {
  var win = setupWindow()

  setupMenu()

  setupFileIPCs(win, electron.ipcMain, win.webContents)

  var osm = setupOsm()

  setupServer(osm)

  setTimeout(function () {
    testSqlite3(win)
  }, 1000)

  function setupWindow () {
    var indexHtml = 'file://' + path.resolve(__dirname, './index.html')
    var win = createWindow(indexHtml)

    win.on('closed', function () {
      app.quit()
    })

    return win
  }

  function setupMenu () {
    var template = require('./lib/menu')(app)
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  function setupOsm () {
    var dataPath = path.join(app.getPath('userData'), 'mapfilter-data')
    return createOsm(dataPath)
  }

  function setupServer (osm) {
    var nodeServer = server(osm)
    nodeServer.listen(config.servers.http.port)
  }
}

function createWindow (indexFile) {
  var win = new BrowserWindow({title: app.getName(), show: false})
  win.once('ready-to-show', () => win.show())
  win.maximize()
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

function createOsm (dataPath) {
  var osm = createOsmDb(dataPath)
  var obs = createOsmObservationsDb(dataPath, osm)
  return {
    osm: osm,
    obs: obs
  }
}

function createOsmDb (rootPath) {
  return osmdb(rootPath)
}

function createOsmObservationsDb (rootPath, osm) {
  var db = level(path.join(rootPath, 'osm-obs.db'))
  return obsdb({ db: db, log: osm.log })
}

var argv = parseArguments(process.argv.slice(2))
start(argv)
