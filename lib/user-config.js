var path = require('path')
var app = require('electron').app

var userDataPath = app.getPath('userData')

module.exports = {
  getPresets: function () {
    try {
      return require(path.join(userDataPath, 'presets.json'))
    } catch (e) {
      return
    }
  },
  getImagery: function () {
    try {
      return require(path.join(userDataPath, 'imagery.json'))
    } catch (e) {
      return
    }
  }
}
