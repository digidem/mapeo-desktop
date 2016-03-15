var fs = require('fs')
var path = require('path')
var app = require('electron').app

var userDataPath = app.getPath('userData')
var presetsPath = path.join(userDataPath, 'presets.json')
var cssPath = path.join(userDataPath, 'custom.css')
var imageryPath = path.join(userDataPath, 'imagery.json')

function getJson (filepath, cb) {
  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) return cb(err)
    try {
      cb(null, JSON.parse(data))
    } catch (e) {
      cb(e)
    }
  })
}

module.exports = {
  getPresets: function (cb) {
    getJson(presetsPath, cb)
  },
  getCustomCss: function (cb) {
    fs.readFile(cssPath, 'utf8', cb)
  },
  getImagery: function (cb) {
    getJson(imageryPath, cb)
  }
}
