var path = require('path')

var APP_NAME = 'Mapeo'
var APP_TEAM = 'Digital Democracy'
var APP_VERSION = require('./package.json').version

module.exports = {
  APP_COPYRIGHT: 'Copyright © 2016 ' + APP_TEAM,
  APP_ICON: path.join(__dirname, 'static', 'Mapeo'),
  APP_NAME: APP_NAME,
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME + ' (BETA)',

  AUTO_UPDATE_CHECK_STARTUP_DELAY: 5 * 1000 /* 5 seconds */,
  // AUTO_UPDATE_URL: 'https://webtorrent.io/desktop/update' +
  //  '?version=' + APP_VERSION + '&platform=' + process.platform,

  GITHUB_URL: 'https://github.com/digidem/mapeo-desktop',
  GITHUB_URL_RAW: 'https://raw.githubusercontent.com/digidem/mapeo-desktop/master',

  IS_PRODUCTION: isProduction(),

  ROOT_PATH: __dirname,
  STATIC_PATH: path.join(__dirname, 'static'),

  WINDOW_MAIN: 'file://' + path.join(__dirname, 'renderer', 'main.html')
}

function isProduction () {
  if (!process.versions.electron) {
    return false
  }
  if (process.platform === 'darwin') {
    return !/\/Electron\.app\/Contents\/MacOS\/Electron$/.test(process.execPath)
  }
  if (process.platform === 'win32') {
    return !/\\electron\.exe$/.test(process.execPath)
  }
  if (process.platform === 'linux') {
    return !/\/electron$/.test(process.execPath)
  }
}
