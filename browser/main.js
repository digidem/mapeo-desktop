var insertCss = require('insert-css')
var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var merge = require('lodash/merge')

var defaultPresets = require('../vendor/iD/presets.json')
var defaultImagery = require('../vendor/iD/imagery.json')

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
ipc.on('updated-settings', updateSettings)

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
  id.presets(presets || defaultPresets)
}
