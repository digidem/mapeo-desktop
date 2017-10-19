var xhr = require('xhr')
var url = require('url')
var querystring = require('querystring')
var ipc = require('electron').ipcRenderer
var through = require('through2')
var split = require('split2')
var wsock = require('websocket-stream')
var pump = require('pump')
var ipc = require('electron').ipcRenderer
var log = require('../lib/log').Browser()
var remote = require('electron').remote

var osmServerHost = remote.getGlobal('osmServerHost')
var ws = wsock('ws://' + osmServerHost)

var replicationProgress = 0
var file

pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
  console.log(row)
  if (row && row.topic === 'replication-error') {
    resdiv.className = 'alert alert-error'
    resdiv.innerHTML = '<strong>Error:</strong> ' + row.message
    showButtons()
  } else if (row && row.topic === 'replication-data-complete') {
    resdiv.className = 'alert alert-info'
    resdiv.innerHTML = '<strong>Sincronizando:</strong> Actualizando indices... puede demorar un momento'
  } else if (row && row.topic === 'replication-complete') {
    resdiv.className = 'alert alert-success'
    resdiv.innerHTML = '<strong>Sinconización se ha completado exitosamente.</strong><br/>' +
      'Ya debes tener la información más reciente en tu mapa. ' +
      'Haga un click en "OK" para volver al mapa'
    selectExistingBtn.classList.add('hidden')
    selectNewBtn.classList.add('hidden')
    cancelBtn.classList.remove('hidden')
    cancelBtn.classList.add('btn-primary')
    cancelBtn.innerText = 'OK'
  } else if (row && row.topic === 'replication-progress') {
    replicationProgress = (replicationProgress + 1) % 4
    resdiv.innerHTML = '<strong>Sincronizando:</strong> En progreso...   '
    if (replicationProgress === 0) resdiv.innerHTML += '/'
    if (replicationProgress === 1) resdiv.innerHTML += '-'
    if (replicationProgress === 2) resdiv.innerHTML += '\\'
    if (replicationProgress === 3) resdiv.innerHTML += '|'
  }
  next()
})).on('error', function (err) { log.error(err) })

var resdiv = document.getElementById('response')
var cancelBtn = document.getElementById('cancel')
var selectExistingBtn = document.getElementById('select-existing')
var selectNewBtn = document.getElementById('select-new')
var sourceField = document.querySelector('form#sync input[name="source"]')

function selectFile (_file) {
  file = _file
  selectExistingBtn.setAttribute('disabled', 'disabled')
  selectNewBtn.setAttribute('disabled', 'disabled')
  xhr({
    method: 'POST',
    url: 'http://' + osmServerHost + '/replicate',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      source: file
    })
  }, onpost)
}

selectExistingBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-file')
})

selectNewBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('save-file')
})

cancelBtn.addEventListener('click', function (ev) {
  // hack in a default zoom level for example dataset
  if (file && file.match(/arapaho/)) window.location.href = 'index.html#map=14/-105.7680/40.1300'
  else window.location.href = 'index.html'
})

function showButtons () {
  document.querySelector('.lead').classList.remove('hidden')
  selectExistingBtn.removeAttribute('disabled')
  selectNewBtn.removeAttribute('disabled')
  cancelBtn.classList.remove('hidden')
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
    resdiv.innerHTML = '<strong>Sincronizando:</strong> En progreso...'
  }
}

var query = querystring.parse(url.parse(window.location.href).query)
if (query.file) selectFile(query.file)

ipc.on('select-file', function (event, file) {
  if (!file) return
  selectFile(file)
})
