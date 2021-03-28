// @ts-check

const path = require('path')
const { TypedEmitter } = require('tiny-typed-emitter')
const { BrowserWindow } = require('electron')
const pDefer = require('p-defer')

const logger = require('../logger')

// Timeout waiting for a worker to close gracefully before it is force-closed
const CLOSE_TIMEOUT = 5000
// Timeout waiting for a worker to start
const STARTUP_TIMEOUT = 5000
const bootstrapHTMLPath = path.join(__dirname, '../background/index.html')
/** @type {Set<string>} */
const modulesList = new Set()

/** @typedef {'idle' | 'starting' | 'started' | 'error' | 'closing' | 'closed'} StateValue */
/** @typedef {{ value: StateValue, context?: any}} State */
/**
 * @typedef {Object} Events
 * @property {(state: State) => void} state-change
 * @property {(error?: Error) => void} error
 */

/**
 * Manage processes that run in a background window. It's important with
 * electron to not run any processor-intensive tasks in the main process, since
 * that causes the UI to freeze. It's also important not to block the main
 * process IPC, so we set up a MessageChannel directly between the worker and
 * the client running in the main render process
 *
 * @extends {TypedEmitter<Events>}
 */
class BackgroundProcess extends TypedEmitter {
  /**
   * @param {string} modulePath
   */
  constructor (modulePath) {
    super()
    if (modulesList.has(modulePath)) {
      throw new Error(
        `A worker is already initialized for ${modulePath}. Currently only one worker instance per module is supported.`
      )
    }
    this._modulePath = modulePath
    /** @type {BrowserWindow | null} */
    this._win = null
    modulesList.add(modulePath)
    /** @type {State} */
    this._state = { value: 'idle' }
    // For logging
    this._name = path.relative(process.cwd(), modulePath)
  }

  /**
   * @param {State} state
   * @private
   */
  _setState (state) {
    if (state.value !== this._state.value) {
      this.emit('state-change', state)
      if (state.value === 'error') {
        logger.error(`${this._name}: Error: ${state.context.error}`)
        this.emit('error', state.context.error)
      } else {
        logger.debug(`${this._name}: State change: ${state.value}`)
      }
    }
    this._state = state
  }

  /**
   * Resolves when the worker is ready (in 'started' state). Will throw if the
   * worker is in the 'error', 'closing' or 'closed' state, because it will
   * never be 'ready' in those states
   *
   * @returns {Promise<void>}
   * @private
   */
  async _ready () {
    if (
      this._state.value === 'error' ||
      this._state.value === 'closing' ||
      this._state.value === 'closed'
    ) {
      throw new Error(`Worker is in '${this._state.value}' state`)
    }
    return new Promise(resolve => {
      const _this = this
      this.on('state-change', onStateChange)

      function onStateChange (/** @type {State} */ state) {
        if (state.value !== 'started') return
        _this.off('state-change', onStateChange)
        resolve()
      }
    })
  }

  /**
   * Get the current state of the worker
   *
   * @returns {State}
   */
  getState () {
    return this._state
  }

  /**
   * Start the worker in a new BrowserWindow window.
   *
   * Each worker can only be spawned once. Attempting to spawn a worker that is
   * already running will throw an error.
   *
   * @param {any} args Arguments will be serialized to JSON and passed to worker
   * @param {Object} [options]
   * @param {boolean} [options.show] Show the worker browser window for debugging
   * @param {boolean} [options.devTools] Open the dev tools window (implies show=true)
   * @returns {Promise<any>} Resolves once the worker is running, returning the
   * value returned by the worker startup script
   */
  async start (args, { show = false, devTools = false } = {}) {
    if (this._state.value !== 'idle') {
      throw new Error(
        `The worker is currenting ${this._state.value}. Currently each worker can only be spawned once`
      )
    }
    const start = Date.now()
    const name = this._name
    const deferred = pDefer()
    const _this = this

    logger.debug('[STARTUP] Starting background process: ' + name)
    this._setState({ value: 'starting' })

    const argsJSON = JSON.stringify(args)
    const win = (this._win = new BrowserWindow({
      show,
      title: this._name,
      webPreferences: {
        nodeIntegration: true,
        // Appended to process.argv
        additionalArguments: [this._modulePath, argsJSON],
        // Don't throttle animations and timers when the page becomes background
        backgroundThrottling: false,
        // Don't run electron APIs and preload in a separate JavaScript context.
        // In next version of Electron this will default to true, so
        // future-proofing by explicitly setting this to false
        contextIsolation: false
      }
    }))

    win.on('closed', () => {
      this._win = null
      this._setState({ value: 'closed' })
    })

    win.webContents.once('render-process-gone', (event, details) => {
      if (details.reason === 'clean-exit') {
        this._setState({ value: 'closed' })
      } else {
        this._setState({ value: 'error', context: { ...details } })
      }
    })

    const timeoutId = setTimeout(() => {
      win.webContents.off('ipc-messsage', onMessage)
      const error = new Error('Process failed to start')
      this._setState({ value: 'error', context: { error } })
      deferred.reject(error)
    }, STARTUP_TIMEOUT)

    win.webContents.on('ipc-message', onMessage)

    try {
      // await 'did-finish-load'
      await win.loadFile(bootstrapHTMLPath)
      logger.debug(
        `[STARTUP] ${name}: Window loaded in ${Date.now() - start}ms`
      )
      if (devTools) win.webContents.openDevTools()
    } catch (e) {
      this._setState({ value: 'error', context: { error: e } })
      throw e
    }

    return deferred.promise

    /**
     * @param {Electron.Event} event
     * @param {string} channel
     * @param {Error} error
     * @param {any} config
     */
    function onMessage (event, channel, error, config) {
      if (channel !== 'startup') return

      clearTimeout(timeoutId)
      win.webContents.off('ipc-message', onMessage)

      logger.debug(
        `[STARTUP] ${name}: Process started in ${Date.now() - start}ms`
      )

      if (error) {
        _this._setState({ value: 'error', context: { error } })
        deferred.reject(error)
      } else {
        _this._setState({ value: 'started' })
        deferred.resolve(config)
      }
    }
  }

  /**
   * Add a new client to the worker (use when the main renderer first loads or reloads)
   *
   * @param {import('electron').MessagePortMain} port A port returned from new MessagePortMain()
   * @returns {Promise<void>}
   */
  async addClient (port) {
    await this._ready()
    if (!this._win) {
      throw new Error('Unexpected error, window is not defined')
    }
    this._win.webContents.postMessage('new-client', null, [port])
  }

  /**
   * Close the worker gracefully, promise resolves when worker is closed
   *
   * @param {object} [options]
   * @param {number} [options.timeout] Timeout before worker is force-closed, default to CLOSE_TIMEOUT = 5000
   * @returns {Promise<void>}
   */
  async close ({ timeout = CLOSE_TIMEOUT } = {}) {
    return new Promise(resolve => {
      if (!this._win) return resolve()

      this._setState({ value: 'closing' })

      const timeoutId = setTimeout(() => {
        this._win && this._win.destroy()
        this._setState({ value: 'closed' })
      }, timeout)

      this._win.once('closed', () => {
        clearTimeout(timeoutId)
        this._win = null
        this._setState({ value: 'closed' })
        resolve()
      })

      this._win.close()
    })
  }
}

module.exports = BackgroundProcess
