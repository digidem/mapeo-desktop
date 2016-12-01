var config = require('../config')

module.exports = {
  dir: '.',
  arch: 'x64',
  platform: 'darwin',
  icon: config.APP_ICON_PATH + '.icns',
  ignore: /^\/dist/,
  out: 'dist',
  tmpdir: false,
  version: config.ELECTRON_VERSION,
  'app-version': config.APP_VERSION,
  'build-version': '1.0.0',
  prune: true,
  overwrite: true,
  'app-bundle-id': config.APP_BUNDLE_ID
}
