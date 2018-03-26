var insertCss = require('insert-css')
var merge = require('lodash/merge')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var dialog = require('electron').dialog

var progressBar = require('./progressBar')
var welcomeScreen = require('./welcome')
var overlay = require('./overlay')
var log = require('../lib/log').Browser()
var i18n = require('../lib/i18n')

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var $overlay = document.getElementById('overlay')
var $welcome = document.getElementById('welcome')
var $map = document.getElementById('container')

var showedWelcome = localStorage.getItem('showedWelcome')
if (!showedWelcome) {
  localStorage.setItem('showedWelcome', true)
  welcomeScreen($overlay, $welcome, $map)
} else openMap()

updateSettings()

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
var id = iD.Context()
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

var customDefs = id.container()
  .append('svg')
  .style('position', 'absolute')
  .style('width', '0px')
  .style('height', '0px')
  .attr('id', 'custom-defs')
  .append('defs')

customDefs.append('svg')

id.ui()(document.getElementById('container'), function onLoad () {
  if (document.querySelector("a[href*='iD/issues']")) {
    document.querySelector("a[href*='iD/issues']")
      .setAttribute('href', 'https://github.com/digidem/mapeo-desktop/issues')
  }
  if (document.querySelector("a[href='https://github.com/openstreetmap/iD']")) {
    document.querySelector("a[href='https://github.com/openstreetmap/iD']")
      .setAttribute('href', 'https://github.com/digidem/mapeo-desktop')
  }
  if (document.querySelector(".overlay-layer-attribution a")) {
    document.querySelector(".overlay-layer-attribution a").
      setAttribute('href', 'https://github.com/digidem/mapeo-desktop/issues')
  }
  if (document.querySelector(".overlay-layer-attribution a")) {
    document.querySelector(".overlay-layer-attribution a").
      innerHTML = i18n('feedback-contribute-button')
  }
  var aboutList = id.container().select('#about-list')
  // Update label on map move
  var map = id.map();

  var latlon = aboutList.append('li')
  .append('span')
  .text(latlonToPosString(map.center()))

  map.on('move', function () {
    var pos = map.center()
    var s = latlonToPosString(pos)
    console.log(s)
    latlon.text(s)
  })

  updateSettings()
})

window.onbeforeunload = function () { id.save() }

function openMap () {
  $overlay.innerHTML = overlay()
  $overlay.style = 'visibility: visible;'
  $map.style = 'visibility: visible;'
  $welcome.style = 'display: none;'
}

ipc.on('updated-settings', function () {
  updateSettings()
  ipc.send('refresh-window')
})
ipc.on('import-error', console.error)
ipc.on('import-complete', importComplete)
ipc.on('import-progress', importProgress)
ipc.on('zoom-to-data-request', zoomToDataRequest)
ipc.on('zoom-to-data-response', zoomToDataResponse)
ipc.on('zoom-to-latlon-response', zoomToLatLonResponse)

function updateSettings () {
  var presets = ipc.sendSync('get-user-data', 'presets')
  var customCss = ipc.sendSync('get-user-data', 'css')
  var imagery = ipc.sendSync('get-user-data', 'imagery')
  var icons = ipc.sendSync('get-user-data', 'icons')

  if (presets) {
    if (!id) iD.data.presets = merge(iD.data.presets, presets)
  }
  if (customCss) insertCss(customCss)
  if (imagery) {
    if (!imagery.id) {
      imagery = imagery.map(function (i) { i.id = i.name; return i; })
      console.warn('imagery.json should include an id -- using name instead.', imagery)
    }
    iD.data.imagery = imagery
  }
  if (icons) {
    var parser = new DOMParser()
    var iconsSvg = parser.parseFromString(icons, 'image/svg+xml').documentElement
    var defs = customDefs && customDefs.node()
    if (defs) defs.replaceChild(iconsSvg, defs.firstChild)
  }
  log('settings updated')
}

function zoomToDataRequest () {
  ipc.send('zoom-to-data-get-centroid')
}

function importComplete (_, filename) {
  var progress = document.body.querySelector('#progress')
  progress.innerHTML = ''
}

function importProgress (_, filename, index, total) {
  var progress = document.body.querySelector('#progress')
  progress.innerHTML = progressBar(filename, index, total)
}

function zoomToDataResponse (_, loc) {
  translateAndZoomToLocation(loc, 14)
}

function translateAndZoomToLocation (loc, zoom) {
  id.map().centerEase(loc, 1000)
  setTimeout(function () {
    id.map().zoom(zoom)
  }, 1000)
}
function zoomToLatLonResponse (_, lat, lon) {
  id.map().centerEase([lat, lon], 1000)
  setTimeout(function () {
    id.map().zoom(15)
  }, 1000)
}

function latlonToPosString (pos) {
  pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
  pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
  while (pos[0].length < 10) pos[0] += '0'
  while (pos[1].length < 10) pos[1] += '0'
  return pos.toString()
}
