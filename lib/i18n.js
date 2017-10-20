var electron = require('electron')

module.exports = function (str) {
  // TODO: make compatible with transifex
  var messages = (electron.remote) ? electron.remote.app.translations : electron.app.translations
  return messages[str]
}
