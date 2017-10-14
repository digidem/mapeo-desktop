var ipc = require('electron').ipcRenderer

var openMapBtn = document.getElementById('open-map')
openMapBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-map')
})

ipc.on('examples', function (ev, examples) {
  renderExamples(examples)
})

ipc.send('get-examples')

function renderExamples (examples) {
  var examplesElement = document.getElementById('example-datasets')
  for (var i in examples) {
    var example = examples[i]
    var el = document.createElement('div')
    var title = document.createElement('h1')
    title.innerHTML = example.name
    el.appendChild(title)
    el.onclick = function () {
      window.location.href = `replicate_usb.html?file=${example.file}`
    }
    examplesElement.appendChild(el)
  }
}
