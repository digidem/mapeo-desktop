import through from 'through2'
import split from 'split2'
import wsock from 'websocket-stream'
import pump from 'pump'
import {remote} from 'electron'
import xhr from 'xhr'

module.exports = {
  start, parseMessages, getTargets
}

function getTargets (cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var opts = {
    method: 'GET',
    url: 'http://' + osmServerHost + '/sync/targets'
  }
  _req(opts, cb)
}

function start (target, cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var opts = {
    method: 'POST',
    url: 'http://' + osmServerHost + '/sync/start',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(target)
  }
  _req(opts, cb)
}

function parseMessages (cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var ws = wsock('ws://' + osmServerHost)

  return pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
    if (row) cb(row, next)
  })).on('error', cb)
}

function _req (opts, cb) {
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}
