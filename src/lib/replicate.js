import xhr from 'xhr'
import querystring from 'querystring'
import split2 from 'split2'
import pump from 'pump'
import {remote} from 'electron'
import hyperquest from 'hyperquest'

module.exports = {
  start, getTargets
}

function getTargets (cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var opts = {
    method: 'GET',
    url: 'http://' + osmServerHost + '/sync/targets'
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function start (target, cb) {
  var osmServerHost = remote.getGlobal('osmServerHost')
  var url = `http://${osmServerHost}/sync/start?${querystring.stringify(target)}`
  var hq = hyperquest(url)
  return pump(hq, split2())
}
