// @ts-check

const { EventEmitter } = require('events')
const logger = require('./logger')

const channel =
  process.type === 'renderer' ? new BroadcastChannel('mapeo-core') : undefined

/** @typedef {(...args: unknown[]) => any} Callback */

class IPC extends EventEmitter {
  /** @param {{ port: MessagePort | import('electron').MessagePortMain }} opts */
  constructor ({ port }) {
    super()
    /** @type {Map<number, { cb: Callback}>} */
    this.replyHandlers = new Map()
    this.port = port
    this.id = 0
    this._connect()
  }

  /**
   * Call a handler `name` on the server
   *
   * @param {string} name Name of socket to send the message
   * @param {any} args Arguments to pass to the handler
   * @param {Callback} cb Callback with reply
   * @memberof IPC
   */
  send (name, args, cb) {
    if (!cb && typeof args === 'function') {
      cb = args
      args = {}
    }
    const id = this.id++
    this.replyHandlers.set(id, { cb })
    this.port.postMessage({ id, name, args })
    logger.debug('Send IPC message', { id, name, args })
  }

  _connect () {
    /** @type {(event: MessageEvent | import('electron').MessageEvent) => void} */
    const handleMessage = event => {
      const msg = event.data

      if (!isValidIpcMessage(msg)) {
        logger.error('Invalid IPC message', msg)
        return
      }
      logger.debug('Received IPC message', msg)

      const { id, result } = msg
      const handler = this.replyHandlers.get(id)
      if (!handler) return
      this.replyHandlers.delete(id)
      if (!handler.cb) return
      if (msg.type === 'error') {
        handler.cb(result)
      } else {
        handler.cb(null, result)
      }
    }

    // Slight difference in API when this is running in render process vs main process
    if ('onmessage' in this.port) {
      this.port.onmessage = handleMessage
      this.port.onmessageerror = event => {
        logger.error(event.data)
      }
    } else {
      this.port.on('message', handleMessage)
      this.port.start()
    }

    if (channel) {
      channel.onmessage = event => {
        const msg = event.data

        if (!isValidBroadcastMessage(msg)) {
          logger.error('Invalid Broadcast message', msg)
          return
        }
        logger.debug('Received broadcast message', msg)

        const { name, args } = msg
        if (name === 'error') {
          // TODO: Think through how/whether to handle these errors in the UX
          logger.error('Broadcast message error', args)
          return
        }
        this.emit(name, args)
      }
    }
  }
}

module.exports = IPC

/**
 * Validate an IPC message
 *
 * @param {any} message
 * @returns {message is import('./utils/types').IpcResponse}
 */
function isValidIpcMessage (message) {
  if (!message) return false
  if (typeof message.type !== 'string') return false
  if (!(message.type === 'reply' || message.type === 'error')) return false
  if (typeof message.id !== 'number') return false
  return true
}

/**
 * Validate a broadcast message
 *
 * @param {any} message
 * @returns {message is import('./utils/types').IpcBroadcast}
 */
function isValidBroadcastMessage (message) {
  if (!message) return false
  if (typeof message.name !== 'string') return false
  return true
}
