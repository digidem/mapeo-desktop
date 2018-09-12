var path = require('path')
var rimraf = require('rimraf').sync
var packager = require('electron-packager')

// clear old output folder
var distFolder = path.join(__dirname, '..', 'dist')
var installerFolder = path.join(distFolder, 'installer-win-x64')
rimraf(installerFolder)

// package electron exeuctable
packager({
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  icon: path.join('static', 'mapeo.ico'),
  ignore: /^\/dist/,
  out: 'dist',
  prune: true,
  overwrite: true,
  asar: true,
  'version-string': {
    ProductName: 'Mapeo',
    CompanyName: 'Digital Democracy'
  }
}, function (err, appPaths) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(appPaths)
  }
})
