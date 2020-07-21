const app = require('electron').app
const fs = require('fs-extra')
const mkdirp = require('mkdirp')
const Settings = require('@mapeo/settings')
const path = require('path')

const logger = require('../logger')

const DEFAULT_SETTINGS = 'DEFAULT_SETTINGS'

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
  var data = new Settings(userDataPath).getSettings(type)
  if (!data) return getFallbackSettings(type)
  else return data
}

function getFallbackSettings (type) {
  var userDataPath = app.getPath('userData')
  return new Settings(path.join(userDataPath, DEFAULT_SETTINGS)).getSettings(type)
}

function copyFallbackSettings (fallbackSettings, done) {
  // location: the full pathname to the fallback default settings directory
  // which is unzipped and includes presets.json, icons, etc
  // e.g., /path/to/Users/miranda/Mapeo/presets/my-default-fallback-settings/

  // XXX: mapeo-server's static router expects
  //  - userDataPath/presets/default  ~or~
  //  - fallbackPresetsDir/presets/default
  // And we can't copy these styles directly into
  // ... /userDataPath/presets/default, because Windows will throw
  // an EPERM error if you try to copy over them when importing configurations

  // This can be cleaned up once imported configurations exist in their own
  // directories, and presets don't get overridden or copied over each other.
  const userDataPath = app.getPath('userData')
  const defaultSettings = path.join(userDataPath, DEFAULT_SETTINGS, 'presets')
  mkdirp.sync(defaultSettings)
  fs.copy(fallbackSettings, path.join(defaultSettings, 'default'),
    (err) => {
      if (err) logger.error('[ERROR] while unpacking default presets', err)
      else logger.info('Unpacked new default styles and presets')
      done()
    }
  )
}

module.exports = {
  importSettings,
  getSettings,
  getEncryptionKey,
  copyFallbackSettings
}
