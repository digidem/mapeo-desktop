var fs = require('fs-extra')
var path = require('path')
var concat = require('@gmaclennan/concat')
var mkdirp = require('mkdirp')
var EOL = require('os').EOL
var icebox = require('ice-box')()

var mpPath = path.resolve(__dirname, '../id_monkey_patches')
var idPath = path.dirname(require.resolve('iD/package.json'))
var pkg = require('../package.json')
var idDistPath = path.join(idPath, 'dist')

icebox(function (dstPath, done) {
  // var dstPath = path.resolve(__dirname, '../vendor/iD')

  mkdirp.sync(dstPath)

  // Copy all iD dist assets
  fs.copySync(idDistPath, dstPath, {clobber: true})
  fs.copySync(path.join(idPath, 'data/imagery.json'), path.join(dstPath, 'imagery.json'), {clobber: true})

  var patchPath = path.join(dstPath, 'iD-patched.js')

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
  ], path.join(patchPath), finished)

  function finished (err) {
    if (err) throw err

    // needs to happen at build-time: version patch
    fs.writeFileSync(patchPath, fs.readFileSync(patchPath).toString() + EOL + 'iD.version = "' + pkg.version + '"')

    var presets = {
      presets: require('iD/data/presets/presets.json'),
      defaults: require('iD/data/presets/defaults.json'),
      categories: require('iD/data/presets/categories.json'),
      fields: require('iD/data/presets/fields.json')
    }

    fs.writeFileSync(path.join(dstPath, 'presets.json'), JSON.stringify(presets, null, '  '))

    done()
  }
}, function (err, finalPath) {
  if (err) throw err
  console.log(finalPath)
})
