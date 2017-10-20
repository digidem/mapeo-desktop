var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var dialog = require('electron').dialog
var merge = require('lodash/merge')

var defaultPresets = require('../vendor/iD/presets.json')
var defaultImagery = require('../vendor/iD/imagery.json')

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
  document.querySelector("a[href*='iD/issues']").setAttribute('href', 'https://github.com/digidem/mapeo-desktop/issues')
  document.querySelector("a[href='https://github.com/openstreetmap/iD']").setAttribute('href', 'https://github.com/digidem/mapeo-desktop')
  document.querySelector(".overlay-layer-attribution a").
    setAttribute('href', 'https://github.com/digidem/mapeo-desktop/issues')
  document.querySelector(".overlay-layer-attribution a").
    innerHTML = i18n('feedback-contribute-button')
})

var parser = new DOMParser()

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')

iD.oneWayTags.waterway.spring = true;

var id = iD()
  .imagery(defaultImagery)
  .taginfo(iD.services.taginfo())
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

var $overlay = document.getElementById('overlay')
var $welcome = document.getElementById('welcome')
var $map = document.getElementById('container')

var showedWelcome = localStorage.getItem('showedWelcome')
if (!showedWelcome) {
  localStorage.setItem('showedWelcome', true)
  welcomeScreen($overlay, $welcome, $map)
} else openMap()

id.loadLocale = function(cb) {
  // TODO: move to id_monkey_patches
  var locale = iD.detect().locale
  if (locale && iD.data.locales.indexOf(locale) === -1) {
    locale = locale.split('-')[0]
  }
  if (locale && locale !== 'en' && iD.data.locales.indexOf(locale) !== -1) {
    var localePath = id.asset('locales/' + locale + '.json')
    d3.json(localePath, function (err, result) {
      window.locale[locale] = result
      window.locale.current(locale)
      done()
    })
  } else done()

  function done () {
    // after loading translations, monkey patch the openstreetmap specific stuff
    // TODO: update language directly in id-mapeo
    try {
      var translations = require('../id_monkey_patches/locales/' + locale + '.json')
      merge(window.locale[locale], translations)
    } catch (e) {
      log('could not load monkeypatch locale for', locale)
    }

    var translations = ipc.sendSync('get-user-data', 'translations')
    merge(window.locale, translations)
    cb()
    window.onbeforeunload = myOnBeforeLoad
  }
}

d3.select('#container')
.call(id.ui())

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
  id.presets(presets || defaultPresets)
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
