var path = require('path')

var pkg = require('./package.json')

var APP_VERSION = pkg.version
var APP_TEAM = 'Digital Democracy'
var APP_NAME = 'Mapfilter'

module.exports = {
  APP_COPYRIGHT: 'Copyright © 2016 ' + APP_TEAM,
  APP_ICON: path.join(__dirname, 'static', 'Mapeo'),
  APP_NAME: APP_NAME,
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME + ' (ALPHA)',

  ELECTRON_VERSION: pkg.dependencies.electron,

  ROOT_PATH: __dirname
}
