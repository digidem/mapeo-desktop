import xhr from 'xhr'
import { remote } from 'electron'
import hyperquest from 'hyperquest'
import querystring from 'querystring'

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

module.exports = {
  stop,
  destroy,
  leave,
  listen,
  join,
  clearState,
  peers,
  peerStream,
  start,
  createMedia,
  create,
  update,
  del,
  list,
  convert
}

function destroy (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/destroy`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function leave (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/leave`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function join (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/join`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}


function listen (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/listen`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function peerStream (opts) {
  if (!opts) opts = { interval: 1000}
  return hyperquest({
    method: 'GET',
    uri: `${osmServerHost}/sync/peers?interval=${opts.interval}`
  })
}

function peers (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/peers`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    try {
      var data = JSON.parse(body)
      if (data.topic === 'peers') return cb(null, data.message)
      else return cb(new Error('unknown response', data))
    } catch (err) {
      return cb(err)
    }
  })
}

function stop (target, cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/stop`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    cb(null, body)
  })
}

function start (target, opts) {
  if (!opts) opts = {}
  return hyperquest({
    method: 'GET',
    uri: `${osmServerHost}/sync/start?${querystring.stringify(target)}&interval=${opts.interval}`
  })
}

function clearState (cb) {
  var opts = {
    url: `${osmServerHost}/sync/clearState`,
    method: 'GET'
  }
  xhr(opts, cb)
}

function createMedia (buf, cb) {
  var opts = {
    url: `${osmServerHost}/media`,
    method: 'POST',
    body: buf
  }
  xhr(opts, cb)
}

function del (f, cb) {
  // Delete
  var opts = {
    url: `${osmServerHost}/observations/${f.id}`,
    method: 'DELETE'
  }
  xhr(opts, cb)
}

function create (f, cb) {
  var opts = {
    url: `${osmServerHost}/observations`,
    method: 'POST',
    body: f,
    json: true
  }
  xhr(opts, cb)
}

function update (f, cb) {
  var opts = {
    url: `${osmServerHost}/observations/${f.id}`,
    method: 'PUT',
    body: f,
    json: true
  }
  xhr(opts, cb)
}

function list (cb) {
  xhr(`${osmServerHost}/observations`, cb)
}

function convert (f, cb) {
  var opts = {
    url: `${osmServerHost}/observations/to-element/${f.id}`,
    method: 'PUT'
  }
  xhr(opts, cb)
}
