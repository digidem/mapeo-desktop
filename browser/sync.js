var wsock = require('websocket-stream')
var pump = require('pump')
var split = require('split2')
var through = require('through2')
var xhr = require('xhr')

var ws = wsock('ws://' + location.host)
pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
  if (row && row.topic === 'replication-error') {
    resdiv.innerText = row.message
  } else if (row && row.topic === 'replication-complete') {
    resdiv.innerText = 'replication complete!'
    setTimeout(function () {
      location.href = '/'
    }, 500)
  }
  next()
})).on('error', onerror)

function onerror (err) { console.error(err) }

var form = document.querySelector('form#sync')
var resdiv = document.querySelector('#response')

form.addEventListener('submit', function (ev) {
  ev.preventDefault()
  xhr({
    method: 'POST',
    url: '/replicate',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      source: this.elements.source.value
    })
  }, onpost)
})

function onpost (err, res, body) {
  if (err) {
    resdiv.innerText = err.message 
  } else if (res.statusCode !== 200) {
    resdiv.innerText = res.statusCode + ': ' + body
  } else {
    resdiv.innerText = 'replication in progress...'
  }
}
