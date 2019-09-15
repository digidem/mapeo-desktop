var electron = require('electron')

export default function i18n (str, num) {
  // TODO: make compatible with transifex
  var messages = electron.remote
    ? electron.remote.app.translations
    : electron.app.translations
  var msg = messages[str]
  return msg ? msg.replace(/{count}/g, num) : msg
}
