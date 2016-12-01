var config = require('../config')

module.exports = {
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  icon: config.APP_ICON_PATH + '.ico',
  ignore: /^\/dist/,
  out: 'dist',
  version: config.ELECTRON_VERSION,
  'app-version': config.APP_VERSION,
  prune: true,
  overwrite: true,
  asar: true,
  'version-string': {
    ProductName: config.APP_NAME,
    CompanyName: config.APP_TEAM
  }
}
