var path = require('path')
var rimraf = require('rimraf').sync
var spawn = require('cross-spawn').sync
var packager = require('electron-packager')

var pkg = require(path.join('..', 'package.json'))

// clear old output folder
var distFolder = path.join(__dirname, '..', 'dist')
var installerFolder = path.join(distFolder, 'installer-win-x64')
rimraf(installerFolder)

// run "bin/build_id_editor.js"
var res = spawn('npm', ['run', 'build:id'])
if (res.error) {
  console.log(res.error)
  process.exit(1)
}
if (res.status) {
  console.log(res.output.toString())
  process.exit(res.status)
}

// package electron exeuctable
packager({
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  icon: path.join('static', 'mapeo.ico'),
  ignore: /^\/dist/,
  out: 'dist',
  version: pkg.version,
  prune: true,
  overwrite: true,
  asar: true,
  'version-string': {
    ProductName: 'Mapeo',
    CompanyName: 'Digital Democracy'
  },
}, function done_callback (err, appPaths) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(appPaths)
  }
})

