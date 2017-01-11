var appDmg = require('appdmg')
var path = require('path')
var rimraf = require('rimraf')

var config = require('../config')

console.log('OS X: Creating dmg...')

var DIST_PATH = path.join(__dirname, '..', 'dist', 'Mapeo-darwin-x64')
var BUILD_NAME = 'Installar_' + config.APP_NAME + '_v' + config.APP_VERSION

var appPath = path.join(DIST_PATH, config.APP_NAME + '.app')
var targetPath = path.join(DIST_PATH, BUILD_NAME + '_macOS.dmg')
rimraf.sync(targetPath)

// Create a .dmg (OS X disk image) file, for easy user installation.
var dmgOpts = {
  basepath: config.ROOT_PATH,
  target: targetPath,
  specification: {
    title: config.APP_NAME,
    icon: config.APP_ICON + '_installer.icns',
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
dmg.once('error', function (err) {
  console.error(err)
  process.exit(1)
})
dmg.on('progress', function (info) {
  if (info.type === 'step-begin') console.log(info.title + '...')
})
dmg.once('finish', function (info) {
  console.log('OS X: Created dmg @', targetPath)
  process.exit(0)
})
