import events from 'events'
import api from './api'

const WIFI_READY = { topic: 'replication-wifi-ready' }

class SyncManager extends events.EventEmitter {
  constructor () {
    super()
    this.progress = {}
  }

  start (target, opts) {
    if (!target) return this.handleError(new Error('target required, got null'))
    if (!opts) opts = {}
    target.name = target.filename || target.name
    this.progress[target.name] = {
      target: target,
      info: {
        topic: 'replication-waiting'
      }
    }
    this._emitPeers()
    target.name = target.filename || target.name
    var interval = opts.interval || 3000
    var stream = api.start(target, { interval })
    stream.on('data', (data) => {
      try {
        var info = JSON.parse(data.toString())
      } catch (err) {
        this.handleError(new Error('Error in json parsing', err))
      }
      this.progress[target.name] = { target, info }
    })
  }

  _emitPeers () {
    this.peers((err, peers) => {
      if (err) return this.handleError(err)
      this.emit('peers', peers)
    })
  }

  clearState () {
    this.progress = {}
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

  cancel (target) {
    api.stop(target, this.handleError)
  }

  wifiPeers (peers) {
    return peers.filter((p) => p.info && p.info.topic === 'replication-wifi-ready')
  }

  peers (cb) {
    api.peers((err, peers) => {
      if (err) return cb(err)
      // get wifi peers
      // make a copy because we are modifying and returning this
      var state = Object.assign({}, this.progress)
      peers.map((peer) => {
        if (!peer.name) return this.handleError(new Error('No name for this peer why? This should never happen.', peer))
        var progress = this.progress[peer.name]
        console.log(progress)
        state[peer.name] = {
          info: (progress && progress.info) || WIFI_READY,
          target: peer
        }
      })
      cb(null, Object.values(state))
    })
  }
}

export default SyncManager
