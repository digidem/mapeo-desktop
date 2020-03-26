var logger
try {
  logger = require('electron-timber')
} catch (err) {
  // if electron not available, fall back to console
  logger = console
}
module.exports = logger
