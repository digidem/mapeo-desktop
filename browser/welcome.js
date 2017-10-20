var ipc = require('electron').ipcRenderer
var path = require('path')

module.exports = function ($overlay, $welcome, $map) {
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
