var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var merge = require('lodash/merge')

var defaultPresets = require('../vendor/iD/presets.json')
var defaultImagery = require('../vendor/iD/imagery.json')

var log = require('../lib/log').Browser()

var prevhash = localStorage.getItem('location')
if (location.hash) localStorage.setItem('location', location.hash)
else if (prevhash) location.hash = prevhash

window.addEventListener('hashchange', function (ev) {
  localStorage.setItem('location', location.hash)
})

var serverUrl = 'http://' + remote.getGlobal('osmServerHost')

iD.oneWayTags.waterway.spring = true;

var id = iD()
  .imagery(defaultImagery)
  .taginfo(iD.services.taginfo())
  .assetPath('vendor/iD/')
  .preauth({url: serverUrl})
  .minEditableZoom(14)

window.locale.en.inspector.view_on_osm = 'View element source XML'

id.loadLocale = function(cb) {
  var locale = iD.detect().locale
  if (locale && iD.data.locales.indexOf(locale) === -1) {
    locale = locale.split('-')[0]
  }
  if (locale && locale !== 'en' && iD.data.locales.indexOf(locale) !== -1) {
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
    cb()
    window.onbeforeunload = myOnBeforeLoad
  }
}

d3.select('#container')
  .call(id.ui())

function myOnBeforeLoad () {
  context.save()
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

mapboxgl.accessToken = 'pk.eyJ1Ijoibm9mZmxlIiwiYSI6ImNpdWgzZHQ1bTAwb3Qyb3AyZHFzenVwaW4ifQ.mK7DhfggajvLzOOC4bIpGg';
var simple = {
    "version": 8,

    "sources": {
      "osm": {
        "type": "vector",
        //"tiles": ["https://vector.mapzen.com/osm/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-LM25tq4"]
        // "tiles": ["http://tile.mapzen.com/mapzen/vector/v1/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-LM25tq4"]
        "tiles": ["http://localhost:6001/tiles/{z}/{x}/{y}.mvt"]
// /api/0.6/map?bbox=57.41455078125,-20.26219712424651,57.4365234375,-20.241582819542185
      },
        "raster-tiles": {
            "type": "raster",
            "url": "mapbox://mapbox.streets",
            "tileSize": 256
        }
    },
    "layers": [
        {
            "id": "simple-tiles",
            "type": "raster",
            "source": "raster-tiles",
            "minzoom": 0,
            "maxzoom": 22
        },
      {
        "id": "vector-tiles",
        "source": "osm",
        "source-layer": "pois",
        "type": "symbol"
      }
    ]
};

// var mapDiv = document.createElement('div')
// // mapDiv.style.width = "400px"
// // mapDiv.style.height = "300px"
// mapDiv.id = 'mapbox'
// var dataDiv = document.getElementsByClassName('layer layer-data')[0]
// dataDiv.parentNode.insertBefore(mapDiv, dataDiv)

var map = new mapboxgl.Map({
    container: 'mapbox',
    style: simple,
    zoom: 12,
    center: [-75.19042968750009, -0.5932511181406923]
});
map.addControl(new mapboxgl.NavigationControl());
