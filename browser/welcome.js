var ipc = require('electron').ipcRenderer
var path = require('path')
var i18n = require('../lib/i18n')

module.exports = function ($overlay, $welcome, $map) {
  $welcome.innerHTML = render()
  $welcome.style = ''
  $overlay.style = 'visibility: hidden;'
  $map.style = 'visibility: hidden;'
  var examplesPath = path.join(__dirname, 'examples')
  var nextScreenBtns = document.getElementsByClassName('next-screen')
  for (var i in nextScreenBtns) {
    var btn = nextScreenBtns[i]
    btn.onclick = function () {
      var nextScreen = this.getAttribute('data-next')
      this.parentElement.style = 'display: none;'
      document.getElementById(nextScreen).style = 'display: block;'
    }
  }
  var examplesElement = document.getElementById('example-dataset')
  examplesElement.onclick = function () {
    var example = path.join(examplesPath, 'arapaho.sync')
    window.location.href = `replicate_usb.html?file=${example}`
  }

  var presetsBtn = document.getElementById('use-presets')
  presetsBtn.onclick = function () {
    var filename = path.join(examplesPath, 'settings-bengal-v1.0.0.mapeosettings')
    ipc.send('import-settings', filename)
  }

  document.getElementById('skip-intro').addEventListener('click', openMap)
  document.getElementById('open-map').addEventListener('click', openMap)

  function openMap (ev) {
    window.location.href = 'index.html'
  }
}

function render () {
  return `
    <div id="skip-intro">Skip intro</div>
    <div id="screen-1">
      <img src="static/Dd-square-solid-300.png" />
      <h1>${i18n('welcome-screen-1-title')}</h1>
      <p>${i18n('welcome-screen-1-subtitle')}</p>
      <button class="big-button next-screen" data-next="screen-2">
        ${i18n('welcome-screen-1-next-button')}
      </button>
    </div>
    <div id="screen-2" style="display: none;">
      <h1>
        ${i18n('welcome-screen-2-title')}
      </h1>
      <h2 class="intro-text">${i18n('welcome-screen-2-text-1')}</h2>
      <p>${i18n('welcome-screen-2-text-2')}</p>
      <p>${i18n('welcome-screen-2-text-3')}</p>
      <p>${i18n('welcome-screen-2-text-4')}</p>
      <p>${i18n('welcome-screen-2-text-5')}</p>
      <button class="big-button next-screen" data-next="screen-3">
        ${i18n('welcome-screen-2-next-button')}
      </button>
    </div>
    <div id="screen-3" style="display: none;">
      <h2 class="intro-text">${i18n('welcome-screen-3-title')}</h2>
      <div class="action-buttons">
        <button id="example-dataset" class="big-button">
        ${i18n('welcome-screen-3-example-dataset')}
        </button>
        <button id="use-presets" class="big-button">
        ${i18n('welcome-screen-3-use-presets')}
        </button>
        <button id="open-map" class="big-button">
        ${i18n('welcome-screen-3-open-map')}
        </button>
      </div>
    </div>
  `
}
