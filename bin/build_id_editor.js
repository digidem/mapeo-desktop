var fs = require('fs-extra')
var path = require('path')
var concat = require('concat')
var mkdirp = require('mkdirp')

var mpPath = path.resolve(__dirname, '../id_monkey_patches')
var idPath = path.dirname(require.resolve('iD/package.json'))
var idDistPath = path.join(idPath, 'dist')
var dstPath = path.resolve(__dirname, '../vendor/iD')

mkdirp.sync(dstPath)

// Copy all iD dist assets
fs.copySync(idDistPath, dstPath, {clobber: true})
fs.copySync(path.join(idPath, 'data/imagery.json'), path.join(dstPath, 'imagery.json'), {clobber: true})

// Monkey patch and build iD
concat([
  path.join(mpPath, 'start.js'),
  path.join(idDistPath, 'iD.js'),
  path.join(mpPath, 'id-connection.js'),
  path.join(mpPath, 'id-modes-browse.js'),
  path.join(mpPath, 'id-modes-save.js'),
  path.join(mpPath, 'id-ui-account.js'),
  path.join(mpPath, 'id-svg-tagclasses.js'),
  path.join(mpPath, 'osm-auth.js'),
  path.join(mpPath, 'no-slow.js'),
  path.join(mpPath, 'end.js')
], path.join(dstPath, 'iD-patched.js'), done)

function done (err) {
  if (err) console.error(err, err.stack)

  var presets = {
    presets: require('iD/data/presets/presets.json'),
    defaults: require('iD/data/presets/defaults.json'),
    categories: require('iD/data/presets/categories.json'),
    fields: require('iD/data/presets/fields.json')
  }

  fs.writeFileSync(path.join(dstPath, 'presets.json'), JSON.stringify(presets, null, '  '))
}
