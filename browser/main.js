var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')

var presets = ipc.sendSync('get-user-data', 'presets')
var customCss = ipc.sendSync('get-user-data', 'css')
var imagery = ipc.sendSync('get-user-data', 'imagery')

if (customCss) insertCss(customCss)

var id = iD()
  .presets(presets || require('../vendor/iD/presets.json'))
  .imagery(imagery || require('../vendor/iD/imagery.json'))
  .taginfo(iD.services.taginfo())
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

ipc.on('updated-user-data', function (event, type, data) {
  switch (type) {
    case 'presets':
      id.presets(data)
      break
    case 'css':
      insertCss(data)
      break
    case 'imagery':
    console.log(data)
      id.imagery(data)
      break
    default:
      console.warn('unhandled event', event, type)
  }
})

d3.select('#container')
  .call(id.ui())
