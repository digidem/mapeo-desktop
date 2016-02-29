var xhr = require('xhr')
var xtend = require('xtend')

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

osmAuth = function () {
  return {
    authenticated: function () { return true },
    logout: function () { return this },
    authenticate: function (cb) { return cb() },
    bootstrapToken: function (token, cb) { cb(null, this) },
    xhr: function (opts, cb) {
      console.log(opts.method, opts.path, {
        headers: (opts.options || {}).header || {}
      })
      return xhr(xtend(opts, {
        method: opts.method,
        url: opts.path,
        body: opts.content,
        headers: (opts.options || {}).header || {}
      }), function (err, res, body) { cb(err, body) })
    },
    preauth: function (c) {},
    options: function () {}
  }
}
iD.ui.Account = function () {
  return function () {}
}
;(function (original) {
  iD.Connection = function () {
    var res = original.apply(this, arguments)
    res.userDetails = function (cb) {
      cb(null, {
        id: 'anonymous'
      })
    }
    return res
  }
})(iD.Connection)

id = iD()
  .presets({
    presets: require('../vendor/ideditor/data/presets/presets.json'),
    defaults: require('../vendor/ideditor/data/presets/defaults.json'),
    categories: require('../vendor/ideditor/data/presets/categories.json'),
    fields: require('../vendor/ideditor/data/presets/fields.json')
  })
  // .imagery(require('../vendor/ideditor/data/imagery.json'))
  .imagery(require('../imagery.json'))
  .taginfo(iD.services.taginfo())
  .assetPath('dist/')
  .preauth({url: 'http://' + window.location.host})

d3.select('#container')
  .call(id.ui())
