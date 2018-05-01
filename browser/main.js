var insertCss = require('insert-css')
var Dialogs = require('dialogs')
var path = require('path')
var merge = require('lodash/merge')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var shell = require('electron').shell

var progressBar = require('./progressBar')
var welcomeScreen = require('./welcome')
var overlay = require('./overlay')
var log = require('../lib/log').Browser()
var i18n = require('../lib/i18n')
var pkg = require('../package.json')

// @global: iD

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
  .assetPath('node_modules/id-mapeo/dist/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

id.version = pkg.version

var customDefs = id.container()
  .append('svg')
  .style('position', 'absolute')
  .style('width', '0px')
  .style('height', '0px')
  .attr('id', 'custom-defs')
  .append('defs')

customDefs.append('svg')

id.ui()(document.getElementById('container'), function onLoad () {
  var links = document.querySelectorAll('a[href^="http"]')
  links.forEach(function (link) {
    var href = link.getAttribute('href')
    link.onclick = function (event) {
      event.preventDefault()
      shell.openExternal(href)
      return false
    }
  })

  var contributeBtn = document.querySelector('.overlay-layer-attribution a')
  if (contributeBtn) contributeBtn.innerHTML = i18n('feedback-contribute-button')

  // Update label on map move
  var aboutList = id.container().select('#about-list')
  var map = id.map()
  var latlon = aboutList.append('li')
    .append('span')
    .text(latlonToPosString(map.center()))
  id.container().on('mousemove', function () {
    var pos = map.mouseCoordinates()
    var s = latlonToPosString(pos)
    latlon.text(s)
  })

  updateSettings()
})

window.onbeforeunload = function () { id.save() }

function openMap () {
  $overlay.appendChild(overlay())
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
ipc.on('change-language-request', changeLanguageRequest)
ipc.on('zoom-to-data-request', zoomToDataRequest)
ipc.on('zoom-to-data-response', zoomToDataResponse)
ipc.on('zoom-to-latlon-response', zoomToLatLonResponse)

function updateSettings () {
  var presets = ipc.sendSync('get-user-data', 'presets')
  var customCss = ipc.sendSync('get-user-data', 'css')
  var imagery = ipc.sendSync('get-user-data', 'imagery')
  var icons = ipc.sendSync('get-user-data', 'icons')

  if (presets) {
    if (!id) {
      presets.fields = merge(iD.data.presets.fields, presets.fields)
      iD.data.presets = presets
    }
  }
  if (customCss) insertCss(customCss)
  if (imagery) {
    imagery = imagery.map(function (i) {
      if (!id) i.id = i.name
      return i
    })
    iD.data.imagery = iD.data.imagery.concat(imagery)
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
  progress.innerHTML = progressBar(path.basename(filename), index, total)
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

function setLocale (response) {
  ipc.send('set-locale', response)
  $overlay.innerHTML = ''
  $overlay.appendChild(overlay())
  id.ui().restart(response)
}

function changeLanguageRequest () {
  var dialogs = Dialogs()
  dialogs.prompt(i18n('menu-change-language-title'), function (response) {
    if (response) setLocale(response)
  })
}
