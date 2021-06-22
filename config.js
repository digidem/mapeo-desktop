var path = require('path')
var APP_NAME = 'Mapeo'
var APP_TEAM = 'Digital Democracy'
var APP_VERSION = require('./src/build-config').version

var isElectron = typeof process.type === 'string'
// Is `true` when running from Node
var isDev = isElectron ? require('electron-is-dev') : true

// Sorry about this! In production the default config is shipped in the app
// resources folder, but for development we need to copy them into a temporary
// "resources" folder.
var RESOURCES_DIR = isDev
  ? path.join(__dirname, 'temp-resources')
  : process.resourcesPath

module.exports = {
  APP_NAME,
  APP_TEAM,
  APP_VERSION,
  RESOURCES_DIR,
  // This is super confusing... due to hard-coded paths in @mapeo/settings
  // TODO: Clean all of this up in mapeo-server and @mapeo/settings
  DEFAULT_CONFIG_DIR: path.join(RESOURCES_DIR, 'presets'),
  MAPBOX_ACCESS_TOKEN:
    'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg',
  GITHUB_URL: 'https://github.com/digidem/mapeo-desktop',
  GITHUB_URL_RAW:
    'https://raw.githubusercontent.com/digidem/mapeo-desktop/master'
}
