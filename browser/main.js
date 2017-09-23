var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var merge = require('lodash/merge')

var log = require('../lib/log').Browser()

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')

// iD.oneWayTags.waterway.spring = true;

var id = iD.Context()
  .assetPath('vendor/iD/')
  .preauth({urlroot: serverUrl})
  .minEditableZoom(14)

// window.locale.en.inspector.view_on_osm = 'View element source XML'

function loadLocale () {
  var locale = iD.Detect().locale
  if (locale && !iD.dataLocales[locale]) {
    locale = locale.split('-')[0]
  }
  if (locale && locale !== 'en' && iD.dataLocales[locale]) {
    var localePath = id.asset('locales/' + locale + '.json')
    d3.json(localePath, function (err, result) {
      window.locale[locale] = result
      window.locale.current(locale)
      var translations = ipc.sendSync('get-user-data', 'translations')
      merge(window.locale, translations)
      cb()
      window.onbeforeunload = myOnBeforeLoad
    })
  } else {
    window.onbeforeunload = myOnBeforeLoad
  }
}
id.ui()(document.getElementById('container'), loadLocale)

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
ipc.on('updated-settings', function () {
  updateSettings()
  ipc.send('refresh-window')
})
ipc.on('zoom-to-data-request', zoomToDataRequest)
ipc.on('zoom-to-data-response', zoomToDataResponse)

function updateSettings () {
  var presets = ipc.sendSync('get-user-data', 'presets')
  var customCss = ipc.sendSync('get-user-data', 'css')
  var imagery = ipc.sendSync('get-user-data', 'imagery')
  var translations = ipc.sendSync('get-user-data', 'translations')
  var icons = ipc.sendSync('get-user-data', 'icons')
  if (icons) {
    var iconsSvg = parser.parseFromString(icons, 'image/svg+xml').documentElement
    customDefs.node().replaceChild(iconsSvg, customDefs.node().firstChild)
  }
  if (customCss) insertCss(customCss)
  if (translations) merge(window.locale, translations)
  if (imagery) id.imagery(imagery)
  log('updating settings')
  if (presets) id.presets(presets)
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
