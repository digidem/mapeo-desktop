const onExit = require('capture-exit')
const signalExit = require('signal-exit')
const once = require('once')
const { app } = require('electron')

onExit.captureExit()

/**
 * Call a function before the app exits - sledgehammer approach to capture all
 * possible exit scenarios and allow an async exit hook
 *
 * @param {() => void} callback Callback to run before exit
 */
module.exports = function (callback) {
  callback = once(callback)
  onExit.onExit(callback)
  signalExit(callback, { alwaysLast: true })
  app.on('before-quit', e => {
    // Cancel quit and wait for server to close
    if (e) e.preventDefault()
    callback()
  })
}
