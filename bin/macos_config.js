var path = require('path')
var config = require('../config')

var pkg = require(path.join('..', 'package.json'))

// package electron executable
module.exports = {
  dir: '.',
  arch: 'x64',
  platform: 'darwin',
  icon: path.join('static', 'mapeo.icns'),
  ignore: /^\/dist/,
  out: 'dist',
  tmpdir: false,
  'app-version': pkg.version,
  version: config.ELECTRON_VERSION,
  'build-version': '1.0.0',
  prune: true,
  overwrite: true,
  'app-bundle-id': 'org.digital-democracy.mapeo-desktop'
}
