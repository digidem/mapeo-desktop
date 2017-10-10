var ipc = require('electron').ipcRenderer

var EXAMPLES = [
  {
    name: 'Boulder, CO',
    file: 'boulder.sync'
  }
]

var openMapBtn = document.getElementById('open-map')
openMapBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-map')
})
