var fs = require('fs-extra')
var path = require('path')
var concat = require('@gmaclennan/concat')
var mkdirp = require('mkdirp')
var EOL = require('os').EOL

var idPath = path.dirname(require.resolve('iD/package.json'))
var pkg = require('../package.json')
var idDistPath = path.join(idPath, 'dist')
var dstPath = path.resolve(__dirname, '../vendor/iD')

mkdirp.sync(dstPath)

// Copy all iD dist assets
fs.copySync(idDistPath, dstPath, {clobber: true})
var idPath = path.join(idDistPath, 'iD.js')

function done (err) {
  if (err) console.error(err, err.stack)

  // needs to happen at build-time: version patch
  fs.writeFileSync(idPath, fs.readFileSync(idPath).toString() + EOL + 'iD.version = "' + pkg.version + '"')

  var presets = {
    presets: require('iD/data/presets/presets.json'),
    defaults: require('iD/data/presets/defaults.json'),
    categories: require('iD/data/presets/categories.json'),
    fields: require('iD/data/presets/fields.json')
  }

  fs.writeFileSync(path.join(dstPath, 'presets.json'), JSON.stringify(presets, null, '  '))
}
