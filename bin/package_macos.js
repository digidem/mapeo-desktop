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
      platform: 'darwin',
      icon: path.join('static', 'mapeo.icns'),
      ignore: new RegExp('^' + dstPath),
      out: dstPath,
      tmpdir: false,
      version: '1.3.4',
      download: {
        quiet: true
      },
      'app-version': pkg.version,
      'build-version': '1.0.0',
      prune: false,
      overwrite: true,
      'app-bundle-id': 'org.digital-democracy.mapeo-desktop',
      // 'osx-sign': true
    }, function done_callback (err, appPaths) {
      if (err) return console.trace(err)
      done()
    })
  }, function (err, finalPath) {
    if (err) return console.trace(err)
    console.log(finalPath)
  })
})
