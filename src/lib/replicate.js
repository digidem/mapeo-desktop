import xhr from 'xhr'
import querystring from 'querystring'
import split2 from 'split2'
import pump from 'pump'
import {remote} from 'electron'
import hyperquest from 'hyperquest'


module.exports = {
  start, getTargets, announce
}

function announce (cb) {
  var osmServerHost = 'http://' + remote.getGlobal('osmServerHost')
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/announce`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function getTargets (cb) {
  var osmServerHost = 'http://' + remote.getGlobal('osmServerHost')
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/targets`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function start (target, cb) {
  var osmServerHost = 'http://' + remote.getGlobal('osmServerHost')
  var url = `${osmServerHost}/sync/start?${querystring.stringify(target)}`
  var hq = hyperquest(url)
  return pump(hq, split2())
}
