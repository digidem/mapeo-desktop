var path = require('path')
var rimraf = require('rimraf').sync
var spawn = require('cross-spawn').sync
var packager = require('electron-packager')

var pkg = require(path.join('..', 'package.json'))

// clear old output folder
var distFolder = path.join(__dirname, '..', 'dist')
var buildFolder = path.join(distFolder, 'Mapeo-darwin-x64')
rimraf(buildFolder)

// package electron executable
packager({
  dir: '.',
  arch: 'x64',
  platform: 'darwin',
  icon: path.join('static', 'mapeo.icns'),
  ignore: /^\/dist/,
  out: 'dist',
  // TODO(noffle): commented out because a minor/patch of electron-packager broke it.
  // tmpdir: false,
  'app-version': pkg.version,
  'build-version': '1.0.0',
  prune: true,
  overwrite: true,
  'app-bundle-id': 'org.digital-democracy.mapeo-desktop',
  // 'osx-sign': true
}, function done_callback (err, appPaths) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(appPaths)
  }
})

