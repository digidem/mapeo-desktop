var appDmg = require('appdmg')
var path = require('path')

function createConfiguration () {
  var config = require('../config')

  var distFolder = path.join(__dirname, '..', 'dist')
  var installerFolder = path.join(distFolder, 'mapfilter-desktop-darwin-x64')
  var buildName = 'Installar_' + config.APP_NAME + '_v' + config.APP_VERSION
  var appPath = path.join(installerFolder, config.APP_FILE_NAME + '.app')
  var dmgPath = path.join(distFolder, buildName + '_macOS.dmg')

  return {
    basepath: config.ROOT_PATH,
    target: dmgPath,
    specification: {
      title: config.APP_NAME,
      icon: config.APP_ICON + '.icns',
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
}

var config = createConfiguration()
var dmg = appDmg(config)
dmg.once('error', function (err) {
  console.error(err)
  process.exit(1)
})
dmg.once('finish', function (info) {
  console.log(config.target)
  process.exit(0)
})
