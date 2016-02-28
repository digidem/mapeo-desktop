var xhr = require('xhr')
var xtend = require('xtend')

osmAuth = function () {
  return {
    authenticated: function () { return true },
    logout: function () { return this },
    authenticate: function (cb) { return cb() },
    bootstrapToken: function (token, cb) { cb(null, this) },
    xhr: function (opts, cb) {
      return xhr(xtend(opts, {
        method: opts.method,
        url: opts.path,
        body: opts.content,
        headers: (opts.options || {}).header || {}
      }), cb)
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

iD.data.load(function() {
  id = iD()
    .presets(iD.data.presets)
    .imagery(iD.data.imagery)
    .taginfo(iD.services.taginfo())
    .assetPath('dist/')

  d3.select('#container')
    .call(id.ui())

  d3.select('#about-list').insert('li', '.user-list')
    .attr('class', 'source-switch')
    .call(iD.ui.SourceSwitch(id))
})
