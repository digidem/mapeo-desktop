var appDmg = require('appdmg')
var path = require('path')
var rimraf = require('rimraf')
var icebox = require('ice-box')()
var arg = require('argv-or-stdin')

var config = require('../config')

arg(function (err, srcPath) {
  icebox(function (dstPath, done) {
    var DIST_PATH = path.join(srcPath, 'Mapeo-darwin-x64')
    var BUILD_NAME = 'Installar_' + config.APP_NAME + '_v' + config.APP_VERSION

    var appPath = path.relative(config.ROOT_PATH, path.join(DIST_PATH, config.APP_NAME + '.app'))
    var targetPath = path.join(dstPath, BUILD_NAME + '.dmg')

    // Create a .dmg (OS X disk image) file, for easy user installation.
    var dmgOpts = {
      basepath: config.ROOT_PATH,
      target: targetPath,
      specification: {
        title: config.APP_NAME,
        icon: config.APP_ICON + '.icns',
        // background: path.join(config.STATIC_PATH, 'appdmg.png'),
        'icon-size': 128,
        contents: [
          { x: 122, y: 240, type: 'file', path: appPath },
          { x: 380, y: 240, type: 'link', path: '/Applications' },
          // Hide hidden icons out of view, for users who have hidden files shown.
          // https://github.com/LinusU/node-appdmg/issues/45#issuecomment-153924954
          { x: 50, y: 500, type: 'position', path: '.background' },
          { x: 100, y: 500, type: 'position', path: '.DS_Store' },
          { x: 150, y: 500, type: 'position', path: '.Trashes' },
          { x: 200, y: 500, type: 'position', path: '.VolumeIcon.icns' }
        ]
      }
    }

    var dmg = appDmg(dmgOpts)
    dmg.once('error', done)
    dmg.once('finish', done)
  }, function (err, finalPath) {
    if (err) {
      console.trace(err)
      process.exit(1)
    }
    console.log(finalPath)
  })
})
