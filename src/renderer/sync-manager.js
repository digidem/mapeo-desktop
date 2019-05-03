import events from 'events'
import api from './api'

class SyncManager extends events.EventEmitter {
  constructor () {
    super()
    this.handleError = this.handleError.bind(this)
  }

  start (target, opts) {
    if (!target) return this.handleError(new Error('target required, got null'))
    if (!opts) opts = {}
    target.name = target.filename || target.name
    api.start(target)
  }

  _emitPeers () {
    var stream = this.stream = api.peerStream()
    var ondata = (data) => {
      try {
        var peers = JSON.parse(data)
        this.emit('peers', peers.message)
      } catch (err) {
        onend(err)
      }
    }
    var onend = (err) => {
      if (err) this.handleError(err)
      stream.removeListener('data', ondata)
      stream.removeListener('error', onend)
      stream.removeListener('end', onend)
    }

    stream.on('data', ondata)
    stream.on('error', onend)
    stream.on('end', onend)
  }

  handleError (err) {
    if (err) this.emit('error', err)
  }

  join () {
    api.join(this.handleError)
    this._emitPeers()
  }

  leave () {
    api.leave(this.handleError)
    if (this.stream) this.stream.destroy()
  }

  destroy (cb) {
    api.destroy(this.handleError)
  }

  listen (cb) {
    api.listen(this.handleError)
  }

  cancel (target) {
    api.stop(target, this.handleError)
  }

  wifiPeers (peers) {
    return peers.filter((p) => p.info && p.info.topic === 'replication-wifi-ready')
  }
}

export default SyncManager
