var path = require('path')

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
  version: '1.3.4',
  'app-version': pkg.version,
  'build-version': '1.0.0',
  prune: true,
  overwrite: true,
  'app-bundle-id': 'org.digital-democracy.mapeo-desktop'
}
