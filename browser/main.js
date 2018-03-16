var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var dialog = require('electron').dialog

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

document.addEventListener("DOMContentLoaded",  function () {
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
})

var parser = new DOMParser()

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')

var id = iD.Context()
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

// window.locale.en.inspector.view_on_osm = 'View element source XML'

var $overlay = document.getElementById('overlay')
var $welcome = document.getElementById('welcome')
var $map = document.getElementById('container')

var showedWelcome = localStorage.getItem('showedWelcome')
if (!showedWelcome) {
  localStorage.setItem('showedWelcome', true)
  welcomeScreen($overlay, $welcome, $map)
} else openMap()

id.ui()(document.getElementById('container'))

function myOnBeforeLoad () {
  id.save()
}

var parser = new DOMParser()
var customDefs = id.container()
  .append('svg')
  .style('position', 'absolute')
  .style('width', '0px')
  .style('height', '0px')
  .attr('id', 'custom-defs')
  .append('defs')

customDefs.append('svg')
updateSettings()


function myOnBeforeLoad () {
  id.save()
}

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

ipc.on('zoom-to-data-request', zoomToDataRequest)
ipc.on('zoom-to-data-response', zoomToDataResponse)
ipc.on('zoom-to-latlon-response', zoomToLatLonResponse)

function updateSettings () {
  var presets = ipc.sendSync('get-user-data', 'presets')
  var customCss = ipc.sendSync('get-user-data', 'css')
  var imagery = ipc.sendSync('get-user-data', 'imagery')
  var icons = ipc.sendSync('get-user-data', 'icons')

  if (presets) iD.data.presets = presets
  if (customCss) insertCss(customCss)
  if (imagery) iD.data.imagery = imagery
  if (icons) {
    var iconsSvg = parser.parseFromString(icons, 'image/svg+xml').documentElement
    customDefs.node().replaceChild(iconsSvg, customDefs.node().firstChild)
  }
  log('settings updated')
}

function zoomToDataRequest () {
  ipc.send('zoom-to-data-get-centroid')
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
