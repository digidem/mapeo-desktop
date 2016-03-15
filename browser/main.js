var remote = require('remote')
var path = require('path')

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var serverUrl = 'http://' + require('remote').getGlobal('osmServerHost')

var customPresets = remote.require('./lib/user-config').getPresets()
var customImagery = remote.require('./lib/user-config').getImagery()

var presets = customPresets || require('../vendor/iD/presets.json')
var imagery = customImagery || require('../vendor/iD/imagery.json')

id = iD()
  .presets(presets)
  .imagery(imagery)
  .taginfo(iD.services.taginfo())
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

d3.select('#container')
  .call(id.ui())
