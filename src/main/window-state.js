'use strict'

const remote = require('@electron/remote/main')
const electron = require('electron')

const store = require('../store')

const defaults = {
  maximize: false,
  fullscreen: false,
  defaultWidth: 800,
  defaultHeight: 600,
  isMaximized: true,
  show: false
}

/**
 * Store window size and position and restore it when the user restarts
 * Adapted from https://github.com/mawie81/electron-window-state (MIT License)
 */
module.exports = function (options) {
  const screen = electron.screen || remote.screen
  let state
  let winRef
  let stateChangeTimer
  const eventHandlingDelay = 100
  const config = Object.assign(defaults, options)

  function isNormal (win) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen()
  }

  function hasBounds () {
    return (
      state &&
      Number.isInteger(state.x) &&
      Number.isInteger(state.y) &&
      Number.isInteger(state.width) &&
      state.width > 0 &&
      Number.isInteger(state.height) &&
      state.height > 0
    )
  }

  function resetStateToDefault () {
    const displayBounds = screen.getPrimaryDisplay().bounds

    // Reset state to default values on the primary display
    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600,
      x: 0,
      y: 0,
      displayBounds
    }
  }

  function windowWithinBounds (bounds) {
    return (
      state.x >= bounds.x &&
      state.y >= bounds.y &&
      state.x + state.width <= bounds.x + bounds.width &&
      state.y + state.height <= bounds.y + bounds.height
    )
  }

  function ensureWindowVisibleOnSomeDisplay () {
    const visible = screen.getAllDisplays().some(display => {
      return windowWithinBounds(display.bounds)
    })

    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetStateToDefault()
    }
  }

  function validateState () {
    const isValid =
      state && (hasBounds() || state.isMaximized || state.isFullScreen)
    if (!isValid) {
      state = defaults
      return
    }

    if (hasBounds() && state.displayBounds) {
      ensureWindowVisibleOnSomeDisplay()
    }
  }

  function updateState (win) {
    win = win || winRef
    if (!win) {
      return
    }
    // Don't throw an error when window was closed
    try {
      const winBounds = win.getBounds()
      if (isNormal(win)) {
        state.x = winBounds.x
        state.y = winBounds.y
        state.width = winBounds.width
        state.height = winBounds.height
      }
      state.isMaximized = win.isMaximized()
      state.isFullScreen = win.isFullScreen()
      state.displayBounds = screen.getDisplayMatching(winBounds).bounds
    } catch (err) {}
  }

  function saveState (win) {
    // Update window state only if it was provided
    if (win) {
      updateState(win)
    }

    // Save state
    try {
      store.set('state', state)
    } catch (err) {
      // Don't care
      state = defaults
    }
  }

  function stateChangeHandler () {
    // Handles both 'resize' and 'move'
    clearTimeout(stateChangeTimer)
    stateChangeTimer = setTimeout(updateState, eventHandlingDelay)
  }

  function closeHandler () {
    updateState()
  }

  function closedHandler () {
    // Unregister listeners and save state
    unmanage()
    saveState()
  }

  function manage (win) {
    if (config.maximize && state.isMaximized) {
      win.maximize()
    }
    if (config.fullScreen && state.isFullScreen) {
      win.setFullScreen(true)
    }
    win.on('resize', stateChangeHandler)
    win.on('move', stateChangeHandler)
    win.on('close', closeHandler)
    win.on('closed', closedHandler)
    winRef = win
  }

  function unmanage () {
    if (winRef) {
      winRef.removeListener('resize', stateChangeHandler)
      winRef.removeListener('move', stateChangeHandler)
      clearTimeout(stateChangeTimer)
      winRef.removeListener('close', closeHandler)
      winRef.removeListener('closed', closedHandler)
      winRef = null
    }
  }

  // Load previous state
  try {
    state = store.get('state', defaults)
  } catch (err) {
    state = defaults
  }

  // Check state validity
  validateState()

  return {
    get x () {
      return state.x
    },
    get y () {
      return state.y
    },
    get width () {
      return state.width
    },
    get height () {
      return state.height
    },
    get displayBounds () {
      return state.displayBounds
    },
    get isMaximized () {
      return state.isMaximized
    },
    get isFullScreen () {
      return state.isFullScreen
    },
    saveState,
    unmanage,
    manage,
    resetStateToDefault
  }
}
