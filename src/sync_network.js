var wsock = require('websocket-stream')
var pump = require('pump')
var split = require('split2')
var through = require('through2')
var xhr = require('xhr')

var i18n = require('./lib/i18n')

var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var osmServerHost = remote.getGlobal('osmServerHost')

var ws = wsock('ws://' + osmServerHost)

pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
  if (row) {
    if (row.topic === 'replication-complete') {
      onReplicationComplete()
    }
    if (row.topic === 'replication-error') {
      onReplicationError(row.message)
    }
  }
  next()
})).on('error', onerror)

function onerror (err) { console.error(err) }

var syncButtons = []
var cancelBtn = document.getElementById('cancel')
var resdiv = document.getElementById('response')
var syncTargets = document.getElementById('sync-targets')

function addSyncTarget (target) {
  // console.error('addSyncTarget', target)

  var networkElem = document.createElement('div')
  networkElem.className = 'network-element'
  syncTargets.appendChild(networkElem)

  var center = document.createElement('center')
  networkElem.appendChild(center)

  var p = document.createElement('p')
  p.innerText = target.name
  center.appendChild(p)

  var btn = document.createElement('button')
  btn.setAttribute('id', 'sync-button-' + target.name)
  btn.setAttribute('type', 'button')
  btn.className = 'btn btn-primary btn-lg'
  center.appendChild(btn)

  var span = document.createElement('span')
  span.className = 'glyphicon glyphicon-save'
  span.setAttribute('aria-hidden', 'true')
  btn.appendChild(span)

  var spanBtn = document.createElement('span')
  spanBtn.innerText = i18n('sync-database-add-changes')
  btn.appendChild(spanBtn)

  btn.addEventListener('click', function (ev) {
    ev.preventDefault()
    selectSyncTarget(target)
  })
  syncButtons.push(btn)

  // The above models
  //
  // <div class="network-element">
  //   <center>
  //     <p>SOME NETWORK</p>
  //     <button id="select" type="button" class="btn btn-primary btn-lg">
  //       <span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
  //       &nbsp;
  //       <span id="button-text">Sync</span>
  //     </button>
  //   </center>
  // </div>
}

function selectSyncTarget (target) {
  if (!target) return

    // hide sync targets after successful sync
  syncTargets.classList.add('hidden')
  cancelBtn.setAttribute('disabled', 'disabled')

  // TODO: set selected button to 'sync' text
  // buttonText.innerText = 'Sincronizando…'

  ipc.send('sync-to-target', target)
}

cancelBtn.addEventListener('click', function (ev) {
  window.location.href = 'index.html'
})

xhr({
  method: 'GET',
  url: 'http://' + osmServerHost + '/sync_targets',
  headers: {
    'content-type': 'application/json'
  },
}, onSyncTargets)

function onSyncTargets (err, res, bodyJson) {
  try {
    var body = JSON.parse(bodyJson)
    // console.error('sync-targets POST res:', body)
    body.forEach(addSyncTarget)
  } catch (err) {
    onReplicationError(err.message)
  }
}

function onReplicationComplete () {
  cancelBtn.classList.remove('hidden')
  cancelBtn.classList.add('btn-primary')
  cancelBtn.removeAttribute('disabled')
  cancelBtn.innerText = 'OK'

  resdiv.className = 'alert alert-success'
  resdiv.innerHTML = i18n('replication-complete')
}

function onReplicationError (err) {
  // re-enable all sync buttons
  syncButtons.forEach(function (btn) {
    btn.removeAttribute('disabled')
  })

  resdiv.className = 'alert alert-error'
  resdiv.innerHTML = '<strong>Error:</strong> ' + err
}
