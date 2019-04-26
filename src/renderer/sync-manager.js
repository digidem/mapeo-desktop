import events from 'events'
import api from './api'

class SyncManager extends events.EventEmitter {
  start (target, opts) {
    if (!target) return this.handleError(new Error('target required, got null'))
    if (!opts) opts = {}
    target.name = target.filename || target.name
    this._emitPeers()
    api.start(target)
  }

  _emitPeers () {
    this.peers((err, peers) => {
      if (err) return this.handleError(err)
      this.emit('peers', peers)
    })
  }

  clearState () {
    api.clear(this.handleError)
  }

  handleError (err) {
    if (err) this.emit('error', err)
  }

  join () {
    api.join(this.handleError)
    this.interval = setInterval(this._emitPeers.bind(this), 2000)
  }

  leave () {
    if (this.interval) clearInterval(this.interval)
    api.leave(this.handleError)
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

  peers (cb) {
    api.peers(cb)
  }
}

export default SyncManager
