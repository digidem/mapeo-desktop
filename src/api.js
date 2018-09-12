import xhr from 'xhr'
import { remote } from 'electron'
import querystring from 'querystring'

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

module.exports = {
  unannounce,
  announce,
  getTargets,
  start,
  createMedia,
  create,
  update,
  del,
  list,
  convert
}

function unannounce (cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/unannounce`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    return cb(null, body)
  })
}

function announce (cb) {
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
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/targets`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    try {
      return cb(null, JSON.parse(body))
    } catch (err) {
      return cb(err)
    }
  })
}

function start (target, cb) {
  var opts = {
    method: 'GET',
    url: `${osmServerHost}/sync/start?${querystring.stringify(target)}`
  }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    cb(null, body)
  })
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
