var app = require('electron').app
var Settings = require('@mapeo/settings')

var logger = require('../logger')

function importSettings (win, settingsFile, cb) {
  var userDataPath = app.getPath('userData')
  var settings = new Settings(userDataPath)
  settings.importSettings(settingsFile, function (err) {
    if (err) return cb(err)
    win.webContents.send('force-refresh-window')
    cb()
  })
}

function getEncryptionKey () {
  const metadata = getSettings('metadata')
  const projectKey = metadata.projectKey
  if (projectKey) {
    logger.log('Found projectKey starting with ', projectKey.slice(0, 4))
  } else logger.log("No projectKey found, using default 'mapeo' key")
  return projectKey
}

function getSettings (type) {
  var userDataPath = app.getPath('userData')
  return new Settings(userDataPath).getSettings(type)
}

module.exports = {
  importSettings: importSettings,
  getSettings: getSettings,
  getEncryptionKey: getEncryptionKey
}
