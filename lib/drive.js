var namedArchives = require('hyperdrive-named-archives')
var hyperdrive = require('hyperdrive')
var filestore = require('random-access-file')
var sub = require('subleveldown')
var path = require('path')

var DRIVE = 'd'
var NAMED = 'n'

module.exports = function (db, opts) {
  var dir = opts.dir
  var named = namedArchives({
    drive: hyperdrive(sub(db, DRIVE)),
    db: sub(db, NAMED)
  })
  return named.createArchive('media', {
    live: true,
    file: function (name) {
      var file = path.join(dir, name)
      return filestore(file)
    }
  })
}
