var path = require('path')
var pkg = require(path.join('..', 'package.json'))
var config = require('../config')

module.exports = {
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  icon: path.join('static', 'mapeo.ico'),
  ignore: /^\/dist/,
  out: 'dist',
  version: config.ELECTRON_VERSION,
  'app-version': pkg.version,
  prune: true,
  overwrite: true,
  asar: true,
  'version-string': {
    ProductName: 'Mapeo',
    CompanyName: 'Digital Democracy'
  }
}
