var fs = require('fs-extra')
var path = require('path')
var concat = require('@gmaclennan/concat')
var mkdirp = require('mkdirp')
var EOL = require('os').EOL
var merge = require('lodash/merge')

var idPath = path.dirname(require.resolve('id-mapeo/package.json'))
var pkg = require('../package.json')
var idDistPath = path.join(idPath, 'dist')
var dstPath = path.resolve(__dirname, '../vendor/iD')

mkdirp.sync(dstPath)

// Copy all iD dist assets
fs.copySync(idDistPath, dstPath, {clobber: true})
var idPath = path.join(idDistPath, 'iD.js')

// needs to happen at build-time: patch locales with mapeo-specific text
var localeDir = path.join(__dirname, '..', 'id_monkey_patches', 'locales')
var locales = fs.readdirSync(localeDir)
locales.forEach(function (filename) {
  var patch = JSON.parse(fs.readFileSync(path.join(localeDir, filename)).toString())
  var idLocale = path.join(dstPath, 'locales', filename)
  var original = JSON.parse(fs.readFileSync(idLocale).toString())

  fs.writeFileSync(idLocale, JSON.stringify(merge(original, patch)))
})
