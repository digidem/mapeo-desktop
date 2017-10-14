var electron = require('electron')
var path = require('path')
var Dat = require('dat-node')

module.exports = Examples

function Examples () {
  if (!(this instanceof Examples)) return new Examples()
  var key = '78f506dcd03b0556cc28cd8638705e0d92dcfcf57cca5c4b2bc057c013f1909f'
  var userDataPath = process.cwd() // electron.app.getPath('userData')
  var examples = path.join(userDataPath, 'data', 'examples')

  var self = this

  Dat(examples, {sparse: true, key}, function (err, dat) {
    if (err) throw err
    dat.joinNetwork()
    self.dat = dat
  })
}

Examples.prototype.download = function (filename, cb) {
  this.dat.archive.download(filename, cb)
}

Examples.prototype.list = function (cb) {
  dat.archive.tree.list('/', {nodes: true}, function (err, entries) {
    if (err) return cb(err)
    entries.filter(function (node) {
      return node.name.endsWith('.sync')
    })
    cb(null, entries)
  })
})

Examples.prototype.close = function (cb) {
  this.dat.close()
}
