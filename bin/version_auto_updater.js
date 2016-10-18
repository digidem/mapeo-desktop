// script to be run on the npm hook, "version"
// updates the version strings in the file "auto_updater.json"
var fs = require('fs')
var strftime = require('strftime')

var pkg = require('../package.json')
var autoUpdate = require('../auto_updater.json')

autoUpdate.name = pkg.version
autoUpdate.win32_tag = 'v' + pkg.version
autoUpdate.url = autoUpdate.url.replace(/v\d+\.\d+\.\d+/, pkg.version)

autoUpdate.pub_date = strftime('%FT%H:%M:%SZ', new Date())

fs.writeFile('auto_updater.json', JSON.stringify(autoUpdate, null, 2), function (err) {
  console.error('err', err)
})
