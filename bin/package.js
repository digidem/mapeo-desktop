var packager = require('electron-packager')

if (process.argv.length !== 3) {
  printUsageAndDie()
}

var config = getPlatformConfiguration(process.argv[2])
if (!config) {
  printUsageAndDie()
}

packager(config, function (err, appPaths) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else if (appPaths.length < 1) {
    throw new Error('expected appPaths to have >= 1 entry')
  } else {
    console.log(appPaths[0])
  }
})

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
