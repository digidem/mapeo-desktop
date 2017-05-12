var path = require('path')

var pkg = require('./package.json')

var APP_VERSION = pkg.version
var APP_TEAM = 'Digital Democracy'
var APP_NAME = 'TiziTizi'

module.exports = {
  APP_COPYRIGHT: 'Copyright © 2016 ' + APP_TEAM,
  APP_ICON_PATH: path.join(__dirname, 'static', 'mapfilter'),
  APP_DESCRIPTION: 'monitoring management app',
  APP_NAME: APP_NAME,
  APP_FILE_NAME: 'tizitizi-desktop',
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME + ' (ALPHA)',
  APP_BUNDLE_ID: 'org.digital-democracy.tizitizi',

  ELECTRON_VERSION: pkg.dependencies.electron,

  ROOT_PATH: __dirname,

  servers: {
    http: {
      host: 'localhost',
      port: 3196
    },
    observations: {
      host: 'localhost',
      port: 3210
    },
    static: {
      host: 'localhost',
      port: 3211
    },
    tiles: {
      host: 'localhost',
      port: 3212
    }
  }
}
