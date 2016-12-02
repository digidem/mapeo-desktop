var rimraf = require('rimraf')
var mkdir = require('mkdirp')

// Delete a directory and recreate it.
module.exports = function (dir, cb) {
  rimraf(dir, function (err) {
    if (err) return cb(err)
    mkdir(dir, cb)
  })
}
