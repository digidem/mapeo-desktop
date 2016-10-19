var path = require('path')
var rimraf = require('rimraf').sync
var spawn = require('cross-spawn').sync
var packager = require('electron-packager')
var icebox = require('ice-box')()
var arg = require('argv-or-stdin')

var pkg = require(path.join('..', 'package.json'))

// take the a build directory as input
arg(function (err, srcPath) {
  icebox(function (dstPath, done) {
    // package electron executable
    packager({
      dir: srcPath,
      arch: 'x64',
      platform: 'win32',
      icon: path.join('static', 'mapeo.ico'),
      ignore: new RegExp('^' + dstPath),
      out: dstPath,
      version: '1.3.4',
      download: {
        quiet: true
      },
      prune: false,
      overwrite: true,
      asar: true,
      'version-string': {
        ProductName: 'Mapeo',
        CompanyName: 'Digital Democracy'
      },
    }, function done_callback (err, appPaths) {
      if (err) return console.trace(err)
      done()
    })
  }, function (err, finalPath) {
    if (err) return console.trace(err)
    console.log(finalPath)
  })
})
