var path = require('path')
var rimraf = require('rimraf')
var packager = require('electron-packager')
var config = require('../config')

if (process.argv.length !== 3) {
  printUsageAndDie()
}

var cfg = getPlatformConfiguration(process.argv[2])
if (!cfg) {
  printUsageAndDie()
}

var distFolder = path.join(config.ROOT_PATH, 'dist')
var buildName = 'mapfilter-desktop-' + cfg.platform + '-' + cfg.arch
var buildFolder = path.join(distFolder, buildName)
rimraf(buildFolder, function (err) {
  if (err) throw err
  doPackaging(cfg)
})

function doPackaging (cfg) {
  packager(cfg, function (err, appPaths) {
    if (err) {
      console.error(err)
      process.exit(1)
    } else if (appPaths.length < 1) {
      throw new Error('expected appPaths to have >= 1 entry')
    } else {
      console.log(appPaths[0])
    }
  })
}

function printUsageAndDie () {
  console.error('USAGE: package.js [windows|macos]')
  process.exit(1)
}

function getPlatformConfiguration (platform) {
  if (platform === 'windows') {
    return require('./windows_config.js')
  } else if (platform === 'macos') {
    return require('./macos_config.js')
  } else {
    return null
  }
}
