var fs = require('fs')
var path = require('path')

module.exports = function examples (cb) {
  var examples = path.join(__dirname, 'examples')
  fs.readdir(examples, function (err, entries) {
    if (err) return cb(err)
    entries = entries.filter(function (node) {
      return node.endsWith('.sync')
    })
    entries = entries.map(function (node) {
      return path.join(examples, node)
    })
    cb(null, entries)
  })
}
