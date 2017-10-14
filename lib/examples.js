var electron = require('electron')
var fs = require('fs')
var path = require('path')
var Dat = require('dat-node')
var events = require('events')
var inherits = require('inherits')

module.exports = Examples

function Examples () {
  if (!(this instanceof Examples)) return new Examples()
  events.EventEmitter.call(this)
  var userDataPath = process.cwd() // electron.app.getPath('userData')
  this.examples = path.join(userDataPath, 'data', 'examples')
}

Examples.prototype.fetch = function (cb) {
  var key = '78f506dcd03b0556cc28cd8638705e0d92dcfcf57cca5c4b2bc057c013f1909f'
  var self = this

  Dat(this.examples, {sparse: true, key}, function (err, dat) {
    if (err) throw err
    dat.joinNetwork()
    self.dat = dat
    self.emit('ready')
    cb()
  })
}

inherits(Examples, events.EventEmitter)

Examples.prototype.download = function (filename, cb) {
  this.dat.archive.download(filename, cb)
}

Examples.prototype.list = function (cb) {
  function done (err, entries) {
    if (err) return cb(err)
    entries = entries.filter(function (node) {
      return node.endsWith('.sync')
    })
    cb(null, entries)
  }
  this.dat ? this.dat.archive.readdir('/', done) : fs.readdir(this.examples, done)
}

Examples.prototype.close = function (cb) {
  this.dat.close()
}
