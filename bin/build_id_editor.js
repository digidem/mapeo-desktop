var fs = require('fs-extra')
var path = require('path')
var mkdirp = require('mkdirp')

var idPath = path.dirname(require.resolve('id-mapeo/package.json'))
var pkg = require('../package.json')
var idDistPath = path.join(idPath, 'dist')
var dstPath = path.resolve(__dirname, '../vendor/iD')

mkdirp.sync(dstPath)

// Copy all iD dist assets
fs.copySync(idDistPath, dstPath, {clobber: true})
