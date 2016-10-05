var electronInstaller = require('electron-winstaller')
var mkdirp = require('mkdirp').sync
var rimraf = require('rimraf').sync
var path = require('path')
var icebox = require('ice-box')()
var arg = require('argv-or-stdin')

var pkg = require(path.join('..', 'package.json'))

arg(function (err, srcPath) {
  icebox(function (dstPath, done) {
    electronInstaller.createWindowsInstaller({
      appDirectory: path.join(srcPath, 'Mapeo-win32-x64'),
      outputDirectory: dstPath,

      usePackageJson: false,

      description: pkg.productDescription,
      authors: pkg.author,
      name: 'Mapeo',
      exe: 'Mapeo.exe',
      setupExe: 'Installar_Mapeo_' + pkg.version + '_Windows.exe',
      iconUrl: 'https://raw.githubusercontent.com/digidem/mapeo-desktop/master/static/mapeo.ico',
      version: pkg.version,
      title: 'mapeo',
    })
    .then(done)
    .catch(function (e) { done(e) })
  }, function (err, finalPath) {
    if (err) return console.trace(err)
    console.log(finalPath)
  })
})
