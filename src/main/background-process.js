// @ts-check

const path = require('path')
const { once } = require('events')
const { TypedEmitter } = require('tiny-typed-emitter')
const { BrowserWindow, ipcMain, app } = require('electron')
const pDefer = require('p-defer')
const isDev = require('electron-is-dev')

const logger = require('../logger')

const userDataPath = app.getPath('userData')

// Timeout waiting for a worker to close gracefully before it is force-closed
const CLOSE_TIMEOUT = 5000
// Timeout waiting for a worker to start
const STARTUP_TIMEOUT = 10000
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
 * @typedef {Object} BackgroundProcessOptions
 * @property {any} [args={}] Arguments to pass to the process at startup
 * @property {boolean} [show=false] Show the window for the process
 * @property {boolean} [devTools=false] Open devtools for the process
 */

/**
 * Manage a process that runs in a background window. It's important with
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
   * @param {BackgroundProcessOptions} [options]
   */
  constructor (modulePath, { args = {}, show = false, devTools = false } = {}) {
    super()
    if (modulesList.has(modulePath)) {
      throw new Error(
        `A worker is already initialized for ${modulePath}. Currently only one worker instance per module is supported.`
      )
    }
    this._modulePath = modulePath
    modulesList.add(modulePath)
    /** @type {State} */
    this._state = { value: 'idle' }
    // For logging
    this._label = `[${path.basename(modulePath)}]`

    /** @type {BrowserWindow | null} */
    this._win = new BrowserWindow({
      show,
      title: path.relative(process.cwd(), modulePath),
      webPreferences: {
        nodeIntegration: true,
        // Appended to process.argv: module path, args for module, user data directory path, mode (development or production)
        additionalArguments: [
          this._modulePath,
          JSON.stringify(args),
          userDataPath,
          isDev ? 'development' : 'production'
        ],
        // Don't throttle animations and timers when the page becomes background
        backgroundThrottling: false,
        // Don't run electron APIs and preload in a separate JavaScript context.
        // In next version of Electron this will default to true, so
        // future-proofing by explicitly setting this to false
        contextIsolation: false
      }
    })

    if (devTools) this._win.webContents.openDevTools()
  }

  /**
   * @param {State} state
   * @private
   */
  _setState (state) {
    if (state === this._state) return
    this._state = state
    this.emit('state-change', state)
    if (state.value === 'error') {
      logger.error(`${this._label} Error: ${state.context.error}`)
      this.emit('error', state.context.error)
    } else {
      logger.debug(`${this._label} State change: ${state.value}`)
    }
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
    if (this._state.value === 'started') return
    return new Promise((resolve, reject) => {
      const _this = this
      this.on('state-change', onStateChange)

      function onStateChange (/** @type {State} */ state) {
        if (state.value === 'error') {
          _this.off('state-change', onStateChange)
          reject(state.context && state.context.error)
        } else if (state.value === 'started') {
          _this.off('state-change', onStateChange)
          resolve()
        }
        // otherwise keep waiting...
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
   * @returns {Promise<any>} Resolves once the worker is running, returning the
   * value returned by the worker startup script
   */
  async start () {
    const win = this._win
    if (this._state.value !== 'idle') {
      throw new Error(
        `The process is currenting ${this._state.value}. Currently each process can only be started once`
      )
    }
    if (!win) {
      throw new Error(
        'Process has been stopped. Currently each process cannot be restarted'
      )
    }
    const deferred = pDefer()
    const _this = this

    this._setState({ value: 'starting' })

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
      win && win.webContents.off('ipc-message', onMessage)

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
   * Add a new client to the process (use when the main renderer first loads or reloads)
   *
   * @param {import('electron').MessagePortMain} port A port returned from new MessagePortMain()
   * @returns {Promise<void>}
   */
  async addClient (port) {
    if (!this._win) {
      throw new Error('Unexpected error, window is not defined')
    }
    await this._ready()
    this._win.webContents.postMessage('new-client', null, [port])
  }

  /**
   * Stop the process gracefully, promise resolves when process is closed
   *
   * @param {object} [options]
   * @param {number} [options.timeout] Timeout before worker is force-closed, default to CLOSE_TIMEOUT = 5000
   * @returns {Promise<void>}
   */
  async stop ({ timeout = CLOSE_TIMEOUT } = {}) {
    if (!this._win) return

    this._setState({ value: 'closing' })

    const timeoutId = setTimeout(() => {
      this._win && this._win.destroy()
      this._setState({ value: 'closed' })
    }, timeout)

    this._win.close()
    await once(this._win, 'closed')
    clearTimeout(timeoutId)
    this._win = null
    this._setState({ value: 'closed' })
  }
}

/**
 * Manage multiple background processes, starting and stopping them together and
 * attaching BrowserWindow instances
 *
 * @extends {TypedEmitter<{'state-change': (state: Record<string, State>) => void, error: (error?: Error) => void }>}
 */
class BackgroundProcessManager extends TypedEmitter {
  constructor () {
    super()
    /** @type {Map<string, BackgroundProcess>} */
    this._processes = new Map()
    /** @type {Map<BrowserWindow, () => void>} */
    this._subscriptions = new Map()
  }

  /**
   * Create a background process to be managed
   *
   * @param {string} modulePath Path to module to load in background process
   * @param {BackgroundProcessOptions & { id: string }} options
   */
  createProcess (modulePath, { id, ...options }) {
    const bp = new BackgroundProcess(modulePath, options)
    this._processes.set(id, bp)
    bp.on('state-change', state => {
      this.emit('state-change', this.getState())
    })
    bp.on('error', error => {
      this.emit('error', error)
    })
  }

  /**
   * Get the combined state of all background processes
   *
   * @returns {Record<string, State>}
   */
  getState () {
    /** @type {Record<string, State>} */
    const state = {}
    for (const [id, bp] of this._processes) {
      state[id] = bp.getState()
    }
    return state
  }

  /**
   * Add a new client to a managed process (use when the main renderer first loads or reloads)
   *
   * @param {string} processId `id` of the managed process you want to add the client to
   * @param {import('electron').MessagePortMain} port A port returned from new MessagePortMain()
   * @returns {Promise<void>}
   */
  async addClient (processId, port) {
    const bp = this._processes.get(processId)
    if (!bp) {
      throw new Error('No process found with id ' + processId)
    }
    return bp.addClient(port)
  }

  /**
   * Subscribe a BrowserWindow to receive 'background-state' events
   * whenever the state changes, and respond to a
   * ipcRenderer.invoke('get-background-state')
   *
   * @param {BrowserWindow} win
   * @returns {() => void} Unsubscribe window to state updates
   */
  subscribeWindow (win) {
    let unsubscribe = this._subscriptions.get(win)
    // Don't subscribe if already subscribed
    if (unsubscribe) return unsubscribe

    ipcMain.handle('get-backend-state', event => {
      if (event.sender !== win.webContents) return
      return this.getState()
    })

    this.on('state-change', onStateChange)

    /** @param {Record<string, State>} state */
    function onStateChange (state) {
      win.webContents.send('backend-state', state)
    }

    unsubscribe = () => {
      this.off('state-change', onStateChange)
      this._subscriptions.delete(win)
    }
    this._subscriptions.set(win, unsubscribe)

    return unsubscribe
  }

  /**
   * Start all background processes, resolves when all have started
   * @returns {Promise<void>}
   */
  async startAll () {
    const processes = Array.from(this._processes.entries())
    await Promise.all(
      processes.map(([id, bp]) =>
        logger.timedPromise(bp.start(), `Started ${id} process`)
      )
    )
  }

  /**
   * Stop all background processes and unsubscribe any subscribed windows,
   * resolves when all have stopped
   * @returns {Promise<void>}
   */
  async stopAll () {
    for (const unsubscribe of this._subscriptions.values()) {
      unsubscribe()
    }
    await Promise.all([...this._processes.values()].map(bp => bp.stop()))
  }
}

module.exports = BackgroundProcessManager
