import through from 'through2'
import split from 'split2'
import wsock from 'websocket-stream'
import pump from 'pump'
import {remote} from 'electron'
import xhr from 'xhr'

module.exports = {
  start, parseMessages
}

function parseMessages (cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var ws = wsock('ws://' + osmServerHost)

  return pump(ws, split(JSON.parse), through.obj(function (row, enc, next) {
    if (row) cb(row, next)
  })).on('error', cb)
}

function start (target, cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  xhr({
    method: 'POST',
    url: 'http://' + osmServerHost + '/sync/file',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(target)
  }, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode !== 200) return cb(new Error(res.statusCode))
    return cb(null, body)
  })
}
