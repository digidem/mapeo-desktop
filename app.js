#!/usr/bin/env electron

var path = require('path')
var fs = require('fs')
var minimist = require('minimist')
var electron = require('electron')
var app = electron.app  // Module to control application life.
var Menu = electron.Menu
var BrowserWindow = electron.BrowserWindow  // Module to create native browser window.
var net = require('net')
var to = require('to2')
var os = require('os')
var userConfig = require('./lib/user-config')
var level = require('level')
var sublevel = require('subleveldown')
var osmdb = require('osm-p2p')
var series = require('run-series')
var appSettings = require('./app-settings.json')
var semver = require('semver')
var rimraf = require('rimraf')
var copyFileSync = require('fs-copy-file-sync')
var installStatsIndex = require('./lib/osm-stats')

var importer = require('./lib/importer')
var locale = require('./lib/locale')
var examples = require('./lib/examples')
var menuTemplate = require('./lib/menu')
var i18n = require('./lib/i18n')

if (require('electron-squirrel-startup')) return

var APP_NAME = app.getName()

var log = require('./lib/log').Node()

var win = null
var server = null
var firstTime = false
var syncWindow = null

// Listen for app-ready event
var appIsReady = false
app.once('ready', function () {
  appIsReady = true
})

// Set up global node exception handler
handleUncaughtExceptions()
log('[STARTUP] Listening for uncaught exceptions')

// Path to `userData`, operating system specific, see
// https://github.com/atom/electron/blob/master/docs/api/app.md#appgetpathname
var userDataPath = app.getPath('userData')

var argv = minimist(process.argv.slice(2), {
  default: {
    port: 5000,
    datadir: path.join(userDataPath, 'data'),
    tileport: 5005
  },
  boolean: [ 'headless', 'debug' ],
  alias: {
    p: 'port',
    t: 'tileport',
    d: 'debug'
  }
})

function startupMsg (txt) {
  return function (done) {
    console.log('[STARTUP] ' + txt)
    done()
  }
}

// The app startup sequence
series([
  versionCheckIndexes,
  startupMsg('Checked indexes version is up-to-date'),

  initOsmDb,
  startupMsg('Initialized osm-p2p'),

  createServers,
  startupMsg('Started osm and tile servers'),

  createMainWindow,
  startupMsg('Created app window')
], function (err) {
  if (err) log('STARTUP FAILED', err)
  else log('STARTUP success!')
})

function initOsmDb (done) {
  var osm = osmdb(argv.datadir)
  installStatsIndex(osm)
  app.osm = osm
  app.importer = importer(osm)

  log('preparing osm indexes..')

  createLoadingWindow()

  done()
}

// Regenerate osm indexes if needed
function versionCheckIndexes (done) {
  var dir = argv.datadir
  var idxDb = level(path.join(dir, 'index'))
  var versionDb = sublevel(idxDb, 'versions')

  versionDb.get('kdb-index', function (err, version) {
    if (err && err.notFound) version = '1.0.0'
    else if (err) return versionDb.close(function (_) { done(err) })  // cleanup!

    idxDb.close(function (_) {
      if (semver.major(appSettings.indexes.kdb.version) > semver.major(version)) {
        log('kdb index must be regenerated (have='+version+', needed='+appSettings.indexes.kdb.version+')')

        // TODO(noffle): in the future, let's be smarter about selectively wiping sub-indexes as needed
        series([wipeAllIndexes, writeUpToDateVersions], done)
      } else {
        log('indexes are up to date!')
        done()
      }
    })
  })

  function wipeAllIndexes (fin) {
    // swallow errors; the indexes might not exist in the first place
    console.log('wiping indexes')
    series([
      function (done) {
        rimraf(path.join(dir, 'index'), function (_) { done() })
      },
      function (done) {
        fs.unlink(path.join(dir, 'kdb'), function (_) { done() })
      }
    ], fin)
  }

  function writeUpToDateVersions (fin) {
    console.log('writing new index versions')
    var idxDb = level(path.join(dir, 'index'))
    var versionDb = sublevel(idxDb, 'versions')
    series([
      function (done) { versionDb.put('kdb-index', appSettings.indexes.kdb.version, done) },
      idxDb.close.bind(idxDb)
    ], fin)
  }
}

function createServers (done) {
  var createServer = require('./server.js')
  server = createServer(app.osm)

  var pending = 2

  server.listen(argv.port, '127.0.0.1', function () {
    global.osmServerHost = '127.0.0.1:' + server.address().port
    log(global.osmServerHost)
    if (--pending === 0) done()
  })

  var tileServer = require('./tile-server.js')()
  tileServer.listen(argv.tileport, function () {
    log('tile server listening on :', server.address().port)
    if (--pending === 0) done()
  })
}

function createLoadingWindow () {
  var INDEX = 'file://' + path.resolve(__dirname, './browser/generating_indexes.html')
  var loadingWin = createNewWindow(INDEX, {height: 200, width: 300, modal: true})

  console.time('Generating indexes')
  app.osm.ready(function () {
    console.timeEnd('Generating indexes')
    log('osm indexes READY')
    loadingWin.close()
    win.reload()
  })

  return loadingWin
}
function createNewWindow (INDEX, winOpts) {
  if (argv.headless) return
  if (!winOpts) winOpts = {}

  var defaults = {
    title: APP_NAME,
    width: 300,
    height: 200,
    modal: false,
    show: false,
    alwaysOnTop: true,
    parent: win
  }
  var loadingWin = new BrowserWindow(Object.assign({}, defaults, winOpts))
  loadingWin.once('ready-to-show', function () {
    loadingWin.setMenu(null)
    loadingWin.show()
  })
  loadingWin.loadURL(INDEX)

  return loadingWin
}

function createMainWindow (done) {
  app.translations = locale.load()
  if (!argv.headless) {
    if (!appIsReady) {
      app.once('ready', ready)
    } else {
      ready()
    }

    app.on('before-quit', server.shutdown)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      app.quit()
    })
  } else {
    done()
  }

  function ready () {
    if (argv.headless) return

    var INDEX = 'file://' + path.resolve(__dirname, './index.html')
    if (!win) {
      win = new BrowserWindow({title: APP_NAME, show: false})
      win.once('ready-to-show', () => win.show())
      win.maximize()
    }
    if (argv.debug) win.webContents.openDevTools()
    win.loadURL(INDEX)

    var ipc = electron.ipcMain

    require('./lib/user-config')

    app.importer.on('import-error', function (err, filename) {
      win.webContents.send('import-error', err, filename)
    })

    app.importer.on('import-complete', function (filename) {
      win.webContents.send('import-complete', filename)
    })

    app.importer.on('import-progress', function (filename, index, total) {
      win.webContents.send('import-progress', filename, index, total)
    })

    ipc.on('set-locale', function (ev, lang) {
      app.translations = locale.load(lang)
    })

    ipc.on('open-new-window', function (ev, filename) {
      var INDEX = 'file://' + path.resolve(__dirname, filename)
      syncWindow = createNewWindow(INDEX, {height: 400, width: 800})
    })

    ipc.on('open-map', function () {
      var MAP = 'file://' + path.resolve(__dirname, './map.html')
      win.loadURL(MAP)
    })

    ipc.on('get-example-filename', function (ev) {
      var tmpdir = os.tmpdir()
      var example = path.join(__dirname, 'examples', 'arapaho.sync')
      var dst = path.join(tmpdir, 'arapaho.sync')
      copyFileSync(example, dst)
      ev.returnValue = dst
    })

    ipc.on('import-settings', function (ev, filename) {
      userConfig.importSettings(win, filename, function (err) {
        if (!err) log('Settings imported from ' + filename)
        return
      })
    })

    ipc.on('save-file', function () {
      var metadata = userConfig.getSettings('metadata')
      var ext = metadata ? metadata.dataset_id : 'mapeodata'
      electron.dialog.showSaveDialog({
        title: i18n('save-db-dialog'),
        defaultPath: 'database.' + ext,
        filters: [
          { name: 'Mapeo Data (*.' + ext + ')', extensions: [ext] },
        ]
      }, onopen)

      function onopen (filename) {
        if (typeof filename === 'undefined') return
        syncWindow.webContents.send('select-file', filename)
      }
    })

    ipc.on('open-file', function () {
      var metadata = userConfig.getSettings('metadata')
      var ext = metadata ? metadata.dataset_id : 'mapeodata'
      electron.dialog.showOpenDialog({
        title: i18n('open-db-dialog'),
        properties: [ 'openFile' ],
        filters: [
          { name: 'Mapeo Data (*.' + ext + ')', extensions: [ext, 'sync'] },
        ]
      }, onopen)

      function onopen (filenames) {
        if (typeof filenames === 'undefined') return
        if (filenames.length === 1) {
          var file = filenames[0]
          syncWindow.webContents.send('select-file', file)
        }
      }
    })

    ipc.on('sync-to-target', syncToTarget)

    ipc.on('zoom-to-data-get-centroid', function () {
      getGlobalDatasetCentroid(function (_, loc) {
        win.webContents.send('zoom-to-data-response', loc)
      })
    })

    ipc.on('zoom-to-latlon-request', function (_, lat, lon) {
      win.webContents.send('zoom-to-latlon-response', lat, lon)
    })

    ipc.on('refresh-window', function () {
      win.reload()
    })

    var menu = Menu.buildFromTemplate(menuTemplate(app))
    Menu.setApplicationMenu(menu)

    // Emitted when the window is closed.
    win.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
      app.quit()
    })

    done()
  }
}

// Move a file, but only if the old one exists and the new one doesn't
function mv (src, dst) {
  try {
    fs.statSync(src)
  } catch (e) {
    return
  }
  try {
    fs.statSync(dst)
  } catch (e) {
    fs.rename(src, dst)
  }
}

function syncToTarget (event, target) {
  log('sync to target', target)
  var socket = net.connect(target.port, target.host, onConnect)

  socket.on('error', function (err) {
    server.send('replication-error', err.message)
  })

  function onConnect () {
    log('connected to', target.name, 'to replicate dataset', target.dataset_id)
    server.replicateNetwork(socket, 'pull')
  }
}

function handleUncaughtExceptions () {
  process.on('uncaughtException', function (error) {
    log('uncaughtException in Node:', error)

    // Show a vaguely informative dialog.
    if (app && win) {
      var opts = {
        type: 'error',
        buttons: [ 'OK' ],
        title: 'Error Fatal',
        message: error.message
      }
      electron.dialog.showMessageBox(win, opts, function () {
        process.exit(1)
      })
    }
  })
}

function getGlobalDatasetCentroid (done) {
  app.osm.stats.getMapCenter(function (err, center) {
    if (err) return log('ERROR(getGlobalDatasetCentroid):', err)
    console.log('center', center)
    done(null, [center.lon, center.lat])
  })
}
