var path = require('path')
var APP_NAME = 'Mapeo'
var APP_TEAM = 'Digital Democracy'
var APP_VERSION = require('./src/build-config').version

function getResourcesDir (isDev) {
  // If running from Node, process.type is not defined
  const isElectron = typeof process.type === 'string'
  if (!isElectron || isDev) return path.join(__dirname, 'temp-resources')
  return process.resourcesPath
}

function getDefaultConfigDir (isDev) {
  // This is super confusing... due to hard-coded paths in @mapeo/settings
  // TODO: Clean all of this up in mapeo-server and @mapeo/settings
  return path.join(getResourcesDir(isDev), 'presets')
}

module.exports = {
  APP_NAME,
  APP_TEAM,
  APP_VERSION,
  MAPBOX_ACCESS_TOKEN:
    'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg',
  GITHUB_URL: 'https://github.com/digidem/mapeo-desktop',
  GITHUB_URL_RAW:
    'https://raw.githubusercontent.com/digidem/mapeo-desktop/master',
  getResourcesDir,
  getDefaultConfigDir
}
