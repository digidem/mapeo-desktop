var wsock = require('websocket-stream')
var pump = require('pump')
var split = require('split2')
var through = require('through2')
var xhr = require('xhr')

var ipc = require('electron').ipcRenderer

var osmServerHost = require('remote').getGlobal('osmServerHost')

var ws = wsock('ws://' + osmServerHost)

pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
  if (row && row.topic === 'replication-error') {
    resdiv.className = 'alert alert-error'
    resdiv.innerHTML = '<strong>Error:</strong> ' + row.message
    showButtons()
  } else if (row && row.topic === 'replication-data-complete') {
    resdiv.className = 'alert alert-info'
    resdiv.innerHTML = '<strong>Sincronizando:</strong> Actualizando indices&hellip; puede demorar un momento'
  } else if (row && row.topic === 'replication-complete') {
    resdiv.className = 'alert alert-success'
    resdiv.innerHTML = '<strong>Sinconización se ha completado exitosamente.</strong><br/>' +
      'Ya debes tener la información más reciente en tu mapa. ' +
      'Haga un click en "OK" para volver al mapa'
    selectBtn.classList.add('hidden')
    cancelBtn.classList.remove('hidden')
    cancelBtn.classList.add('btn-primary')
    cancelBtn.innerText = 'OK'
  }
  next()
})).on('error', onerror)

function onerror (err) { console.error(err) }

var resdiv = document.getElementById('response')
var cancelBtn = document.getElementById('cancel')
var selectBtn = document.getElementById('select')
var buttonText = document.getElementById('button-text')
var sourceField = document.querySelector('form#sync input[name="source"]')

ipc.on('select-dir', function (event, dir) {
  if (!dir) return
  sourceField.value = dir
  selectBtn.setAttribute('disabled', 'disabled')

  buttonText.innerText = 'Sincronizando…'
  xhr({
    method: 'POST',
    url: 'http://' + osmServerHost + '/replicate',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      source: sourceField.value
    })
  }, onpost)
})

selectBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-dir')
})

cancelBtn.addEventListener('click', function (ev) {
  window.location.href = 'index.html'
})

function showButtons () {
  document.querySelector('.lead').classList.remove('hidden')
  selectBtn.removeAttribute('disabled')
  cancelBtn.classList.remove('hidden')
  buttonText.innerText = 'Seleccionar Archivo…'
}

function onpost (err, res, body) {
  resdiv.className = 'alert alert-error'
  cancelBtn.classList.add('hidden')
  document.querySelector('.lead').classList.add('hidden')
  if (err) {
    resdiv.innerText = '<strong>Error:</strong> ' + err.message
    showButtons()
  } else if (res.statusCode !== 200) {
    resdiv.innerHTML = '<strong>Error:</strong> ' + res.statusCode + ': ' + body
    showButtons()
  } else {
    resdiv.className = 'alert alert-info'
    resdiv.innerHTML = '<strong>Sincronizando:</strong> En progreso&hellip'
  }
}
