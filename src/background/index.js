// @ts-check

const { ipcRenderer } = require('electron')
const path = require('path')

const logger = require('../logger')

/** @typedef {import('../utils/types').BackgroundProcess} BackgroundProcess */
/** @typedef {import('../utils/types').IpcResponse} IpcResponse */

const [modulePath, argsJSON, userDataPath, mode] = process.argv.slice(-4)
const label = path.basename(modulePath)

/** @type {'starting' | 'ready' | 'closing' | 'closed'} */
let status = 'starting'

logger.configure({ userDataPath, label, isDev: mode === 'development' })
;(async function initialize () {
  try {
    // TODO: Used by renderer processes to determine if in development mode or not. There's probably a better way to do this
    window.mode = mode

    const args = argsJSON && JSON.parse(argsJSON)

    const start = Date.now()
    /** @type {unknown} */
    const init = require(modulePath)
    logger.debug(`Parsed module Javascript in ${Date.now() - start}ms`)

    if (typeof init !== 'function') {
      throw new Error('Invalid Module in worker, must export a function')
    }

    /** @type {unknown} */
    const bp = init(args)

    if (!isValidBackgroundProcess(bp)) {
      throw new Error(
        'Invalid background process module. A backbground process must have a handlers object, with optional start and close functions'
      )
    }

    window.onbeforeunload = event => {
      logger.debug('Window unload. Current status: ' + status)
      // not using async function for event handler, since this returns a
      // Promise, which _might_ cancel the window close, since spec says that
      // returning anything other than undefined from the event handler cancels
      // close
      if (!bp.close || status === 'closed') return
      event.returnValue = false // cancel window close
      if (status === 'closing') return // don't call close twice
      status = 'closing'
      // close window after worker has closed
      bp.close()
        .catch(err => {
          logger.error('Error trying to close', err)
        })
        .finally(() => {
          status = 'closed'
          window.onbeforeunload = undefined
          window.close()
        })
    }

    ipcRenderer.on('new-client', event => {
      logger.debug('New client received')
      const [port] = event.ports
      port.onmessage = async event => {
        handleMessage(bp.handlers, event.data, port)
      }
      port.onmessageerror = event => {
        logger.error(event.data)
      }
    })

    let startupResult
    if (bp.start) {
      logger.debug('Calling start()')
      startupResult = await bp.start()
    }
    logger.debug('Started; informing main process')
    ipcRenderer.send('startup', null, startupResult)
  } catch (error) {
    logger.error('error', error)
    ipcRenderer.send('startup', error)
  }
})()

/** @typedef {{ id: number, name: string, args: any }} Message */

/**
 * @param {BackgroundProcess['handlers']} handlers
 * @param {unknown} message
 * @param {MessagePort} port
 */
async function handleMessage (handlers, message, port) {
  if (!isValidMessage(message)) {
    // Cannot return anything here
    logger.error('Received invalid IPC message')
    return
  }
  logger.debug('IPC message', message)

  const { id, name, args } = message

  try {
    const handler = handlers[name]

    if (typeof handler !== 'function') {
      throw new Error('Unknown method: ' + name)
    }

    const result = await Promise.resolve(handler(args))

    port.postMessage(/** @type {IpcResponse} */ ({ type: 'reply', id, result }))
  } catch (error) {
    logger.error('IPC error: ' + error.message)
    port.postMessage(
      /** @type {IpcResponse} */ ({ type: 'error', id, result: error.message })
    )
  }
}

/**
 * Validate worker
 *
 * @param {unknown} bp
 * @returns {bp is BackgroundProcess}
 */
function isValidBackgroundProcess (bp) {
  if (!isObject(bp)) return false
  if (bp.start && typeof bp.start !== 'function') {
    return false
  }
  if (bp.close && typeof bp.close !== 'function') {
    return false
  }
  if (typeof bp.handlers !== 'object' && bp.handlers !== null) {
    return false
  }
  return true
}

/**
 * Validate an IPC message request
 *
 * @param {unknown} message
 * @returns {message is import('../utils/types').IpcRequest}
 */
function isValidMessage (message) {
  if (!isObject(message)) return false
  if (typeof message.id !== 'number') {
    return false
  }
  if (typeof message.name !== 'string') {
    return false
  }
  return true
}

/**
 * @param {unknown} something
 * @returns {something is { [prop: string]: unknown }}
 */
function isObject (something) {
  return typeof something === 'object' && something !== null
}
