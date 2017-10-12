var ipc = require('electron').ipcRenderer

var openMapBtn = document.getElementById('open-map')
openMapBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-map')
})

var EXAMPLES = [
  {
    name: 'Boulder, CO',
    file: 'boulder.sync'
  }
]

var examplesElement = document.getElementById('example-datasets')
for (var i in EXAMPLES) {
  var example = EXAMPLES[i]
  var el = document.createElement('div')
  var title = document.createElement('h1')
  title.innerHTML = example.name
  el.appendChild(title)
  el.onclick = function () {
    window.location.href = `replicate_usb.html?file=${example.file}`
  }
  examplesElement.appendChild(el)
}
