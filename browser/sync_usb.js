var wsock = require('websocket-stream')
var pump = require('pump')
var split = require('split2')
var through = require('through2')
var xhr = require('xhr')

var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var osmServerHost = remote.getGlobal('osmServerHost')

var ws = wsock('ws://' + osmServerHost)

var log = require('../lib/log').Browser()

var replicationProgress = 0

pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
  if (row && row.topic === 'replication-error') {
    resdiv.className = 'alert alert-error'
    resdiv.innerHTML = '<strong>Error:</strong> ' + row.message
    showButtons()
  } else if (row && row.topic === 'replication-data-complete') {
    resdiv.className = 'alert alert-info'
    resdiv.innerHTML = '<strong>Syncronizing:</strong> Updating indexes... it could be delayed a moment'
  } else if (row && row.topic === 'replication-complete') {
    resdiv.className = 'alert alert-success'
    resdiv.innerHTML = '<strong>Syncronizing has completed successfully.</strong><br/>' +
      'You now have the most recent information in your map. ' +
      'Clik "OK" to return to the map.'
    selectExistingBtn.classList.add('hidden')
    selectNewBtn.classList.add('hidden')
    cancelBtn.classList.remove('hidden')
    cancelBtn.classList.add('btn-primary')
    cancelBtn.innerText = 'OK'
  } else if (row && row.topic === 'replication-progress') {
    replicationProgress = (replicationProgress + 1) % 4
    resdiv.innerHTML = '<strong>Syncronizing:</strong> In progress...   '
    if (replicationProgress === 0) resdiv.innerHTML += '/'
    if (replicationProgress === 1) resdiv.innerHTML += '-'
    if (replicationProgress === 2) resdiv.innerHTML += '\\'
    if (replicationProgress === 3) resdiv.innerHTML += '|'
  }
  next()
})).on('error', onerror)

function onerror (err) { log.error(err) }

var resdiv = document.getElementById('response')
var cancelBtn = document.getElementById('cancel')
var selectExistingBtn = document.getElementById('select-existing')
var selectNewBtn = document.getElementById('select-new')
var sourceField = document.querySelector('form#sync input[name="source"]')

ipc.on('select-file', function (event, file) {
  if (!file) return
  sourceField.value = file
  selectExistingBtn.setAttribute('disabled', 'disabled')
  selectNewBtn.setAttribute('disabled', 'disabled')

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

selectExistingBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('open-file')
})

selectNewBtn.addEventListener('click', function (ev) {
  ev.preventDefault()
  ipc.send('save-file')
})

cancelBtn.addEventListener('click', function (ev) {
  window.location.href = 'index.html'
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
    resdiv.innerHTML = '<strong>Syncronizing:</strong> In progress...'
  }
}
