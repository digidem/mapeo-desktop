const uuid = require('uuid')
const ipc = require('node-ipc')

class IPC {
  constructor () {
    this.replyHandlers = new Map()
    this.listeners = new Map()
    this.messageQueue = []
    this.socketClient = null
  }

  send (name, args, cb) {
    const id = uuid.v4()
    console.log('sending', name, args, cb)
    this.replyHandlers.set(id, { cb })
    if (this.socketClient) {
      this.socketClient.emit('message', JSON.stringify({ id, name, args }))
    } else {
      this.messageQueue.push(JSON.stringify({ id, name, args }))
    }
  }

  on (name, cb) {
    if (!this.listeners.get(name)) {
      this.listeners.set(name, [])
    }
    this.listeners.get(name).push(cb)

    return () => {
      const arr = this.listeners.get(name)
      this.listeners.set(name, arr.filter(cb_ => cb_ !== cb))
    }
  }

  removeListener (name) {
    this.listeners.set(name, [])
  }

  connect (name, cb) {
    if (!cb) cb = function noop () {}
    this._connect(name, (client) => {
      client.on('message', data => {
        const msg = JSON.parse(data)
        console.log('client got a message', msg)

        if (msg.type === 'error') {
          const { id, result } = msg
          const handler = this.replyHandlers.get(id)
          if (handler) {
            this.replyHandlers.delete(id)
            if (handler.cb) handler.cb(result)
          }
        } else if (msg.type === 'reply') {
          const { id, result } = msg
          const handler = this.replyHandlers.get(id)

          if (handler) {
            this.replyHandlers.delete(id)
            if (handler.cb) handler.cb(null, result)
          }
        } else if (msg.type === 'push') {
          const { name, args } = msg

          const listens = this.listeners.get(name)
          if (listens) {
            listens.forEach(listener => {
              listener(args)
            })
          }
        } else {
          throw new Error('Unknown message type: ' + JSON.stringify(msg))
        }
      })

      client.on('connect', () => {
        this.socketClient = client
        // Send any messages that were queued while closed
        if (this.messageQueue.length > 0) {
          this.messageQueue.forEach(msg => client.emit('message', msg))
          this.messageQueue = []
        }
        cb()
      })

      client.on('disconnect', () => {
        this.socketClient = null
        console.log('Connected!')
      })
    })
  }

  _connect (id, func) {
    ipc.config.silent = true
    ipc.connectTo(id, () => {
      func(ipc.of[id])
    })
  }
}

module.exports = IPC
