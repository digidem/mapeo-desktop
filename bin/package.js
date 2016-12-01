var packager = require('electron-packager')

if (process.argv.length !== 3) {
  printUsageAndDie()
}

var config
if (process.argv[2] === 'windows') {
  config = require('./windows_config.js')
} else if (process.argv[2] === 'macos') {
  config = require('./macos_config.js')
} else {
  printUsageAndDie()
}

packager(config, function (err, appPaths) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(appPaths)
  }
})

function printUsageAndDie () {
  console.error('USAGE: package.js [windows|macos]')
  process.exit(1)
}
