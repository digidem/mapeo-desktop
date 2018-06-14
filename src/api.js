import xhr from 'xhr'
import {remote} from 'electron'
const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

module.exports = { createMedia, create, update, del, list, convert }

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
