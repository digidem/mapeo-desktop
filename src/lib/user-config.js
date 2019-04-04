var fs = require('fs')
var tar = require('tar-fs')
var pump = require('pump')
var path = require('path')

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

class Config {
  constructor (userDataPath) {
    this.userDataPath = userDataPath || require('electron').app.getPath('userData')
    this.cssPath = path.join(this.userDataPath, 'style.css')
    this.iconsPath = path.join(this.userDataPath, 'icons.svg')
  }

  getSettings (type) {
    switch (type) {
      case 'css':
        return readFile(this.cssPath)
      case 'icons':
        return readFile(this.iconsPath)
      case 'presets':
      case 'imagery':
        return readJsonSync(path.join(this.userDataPath, type + '.json'))
      case 'metadata':
        var data = readJsonSync(path.join(this.userDataPath, type + '.json'))
        return Object.assign(METADATA_DEFAULTS, data)
      default:
        return null
    }
  }
  importSettings (settingsFile, cb) {
    var source = fs.createReadStream(settingsFile)
    var dest = tar.extract(this.userDataPath, {
      ignore: function (name) {
        return SETTINGS_FILES.indexOf(path.basename(name)) < 0
      }
    })
    pump(source, dest, cb)
  }
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

module.exports = Config
