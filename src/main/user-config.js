var fs = require('fs')
var tar = require('tar-fs')
var pump = require('pump')
var mkdirp = require('mkdirp')
var path = require('path')
var app = require('electron').app
var userDataPath = app.getPath('userData')
var defaultPath = path.join(userDataPath, 'presets', 'default')
var cssPath = path.join(defaultPath, 'style.css')
var iconsPath = path.join(defaultPath, 'icons.svg')

var SETTINGS_FILES = [
  'presets.json',
  'style.css',
  'imagery.json',
  'icons.svg',
  'metadata.json'
]

var METADATA_DEFAULTS = {
  dataset_id: 'mapeodata'
}

function readJsonSync (filepath) {
  try {
    var data = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

function readFile (filepath) {
  try {
    return fs.readFileSync(filepath, 'utf8')
  } catch (e) {
    return null
  }
}

function importSettings (win, settingsFile, cb) {
  var source = fs.createReadStream(settingsFile)
  mkdirp.sync(defaultPath)
  var dest = tar.extract(defaultPath, {
    ignore: function (name) {
      return SETTINGS_FILES.indexOf(path.basename(name)) < 0
    }
  })
  pump(source, dest, function (err) {
    if (err) return cb(err)
    win.webContents.send('force-refresh-window')
    cb()
  })
}

function getSettings (type) {
  switch (type) {
    case 'css':
      return readFile(cssPath)
    case 'icons':
      return readFile(iconsPath)
    case 'presets':
    case 'imagery':
      return readJsonSync(path.join(defaultPath, type + '.json'))
    case 'metadata':
      var data = readJsonSync(path.join(defaultPath, type + '.json'))
      return Object.assign(METADATA_DEFAULTS, data)
    default:
      return null
  }
}

module.exports = {
  importSettings: importSettings,
  getSettings: getSettings
}
