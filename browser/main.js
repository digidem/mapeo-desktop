var insertCss = require('insert-css')
var userConfig = require('remote').require('./lib/user-config')

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var serverUrl = 'http://' + require('remote').getGlobal('osmServerHost')

var id = iD()
  .presets(require('../vendor/iD/presets.json'))
  .imagery(require('../vendor/iD/imagery.json'))
  .taginfo(iD.services.taginfo())
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

var pending = 3

userConfig.getPresets(function (err, presets) {
  if (!err) id.presets(presets)
  done()
})
userConfig.getImagery(function (err, imagery) {
  if (!err) id.imagery(imagery)
  done()
})
userConfig.getCustomCss(function (err, customCss) {
  if (!err) insertCss(customCss)
  done()
})

function done () {
  if (--pending !== 0) return
  d3.select('#container')
    .call(id.ui())
}
