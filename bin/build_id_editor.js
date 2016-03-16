var fs = require('fs')
var path = require('path')
var concat = require('concat')
var cpr = require('cpr')
var mkdirp = require('mkdirp')

var mpPath = path.resolve(__dirname, '../id_monkey_patches')
var idPath = path.resolve(__dirname, '../node_modules/iD')
var idDstPath = path.join(idPath, 'dist')
var dstPath = path.resolve(__dirname, '../vendor/iD')

mkdirp.sync(dstPath)

// Monkey patch and build iD
concat([
  path.join(mpPath, 'start.js'),
  path.join(idDstPath, 'iD.js'),
  path.join(mpPath, 'id-connection.js'),
  path.join(mpPath, 'id-modes-browse.js'),
  path.join(mpPath, 'id-ui-account.js'),
  path.join(mpPath, 'id-svg-tagclasses.js'),
  path.join(mpPath, 'osm-auth.js'),
  path.join(mpPath, 'end.js')
], path.join(dstPath, 'iD-patched.js'), done)

// Copy all iD dist assets
cpr(idDstPath, dstPath, {overwrite: true}, done)
cpr(path.join(idPath, 'data/imagery.json'), dstPath, {overwrite: true}, done)

var presets = {
  presets: require('../node_modules/iD/data/presets/presets.json'),
  defaults: require('../node_modules/iD/data/presets/defaults.json'),
  categories: require('../node_modules/iD/data/presets/categories.json'),
  fields: require('../node_modules/iD/data/presets/fields.json')
}

fs.writeFileSync(path.join(dstPath, 'presets.json'), JSON.stringify(presets, null, '  '))

function done (err) {
  if (err) console.error(err)
}
