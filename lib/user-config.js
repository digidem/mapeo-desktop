var fs = require('fs')
var tar = require('tar-fs')
var pump = require('pump')
var path = require('path')
var ipc = require('electron').ipcMain
var app = require('electron').app
var userDataPath = app.getPath('userData')
var cssPath = path.join(userDataPath, 'style.css')
var iconsPath = path.join(userDataPath, 'icons.svg')

var SETTINGS_FILES = ['presets.json', 'style.css', 'imagery.json', 'translations.json', 'icons.svg']

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

ipc.on('get-user-data', function (event, type) {
  switch (type) {
    case 'css':
      event.returnValue = readFile(cssPath)
      break
    case 'icons':
      event.returnValue = readFile(iconsPath)
      break
    case 'presets':
    case 'translations':
    case 'imagery':
      event.returnValue = readJsonSync(path.join(userDataPath, type + '.json'))
      break
    default:
      console.warn('unhandled event', event, type)
  }
})

module.exports = {
  importSettings: function (win, settingsFile, cb) {
    var source = fs.createReadStream(settingsFile)
    var dest = tar.extract(userDataPath, {
      ignore: function (name) {
        return SETTINGS_FILES.indexOf(path.basename(name)) < 0
      }
    })
    pump(source, dest, function (err) {
      console.log('gothere')
      if (err) return cb(err)
      win.webContents.send('updated-settings')
      cb()
    })
  }
}
