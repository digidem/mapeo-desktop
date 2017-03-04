var ipc = require('electron').ipcRenderer

var inner = document.getElementById('indicator-inner')
var outer = document.getElementById('indicator-outer')

ipc.on('export-progress', function (event, percent) {
  setProgress(percent)
})

function setProgress (c) {
  c = Math.min(Math.max(c, 0), 1)
  inner.style.width = (c * 394) + 'px'
  inner.innerHTML = Math.round(c * 100) + '%'
}

