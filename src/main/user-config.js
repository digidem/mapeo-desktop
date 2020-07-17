const app = require('electron').app
const Settings = require('@mapeo/settings')

const logger = require('../logger')

function importSettings (settingsFile, cb) {
  var userDataPath = app.getPath('userData')
  var settings = new Settings(userDataPath)
  logger.debug('importing settings', settingsFile, userDataPath)
  settings.importSettings(settingsFile, function (err) {
    if (err) return cb(err)
    cb()
  })
}

function getEncryptionKey () {
  const metadata = getSettings('metadata')
  const projectKey = metadata.projectKey
  if (projectKey) {
    logger.info('Found projectKey starting with ', projectKey.slice(0, 4))
  } else logger.info("No projectKey found, using default 'mapeo' key")
  return projectKey
}

function getSettings (type) {
  var userDataPath = app.getPath('userData')
  return new Settings(userDataPath).getSettings(type)
}

module.exports = {
  importSettings,
  getSettings,
  getEncryptionKey
}
