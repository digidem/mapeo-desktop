const fs = require('fs')
const merge = require('lodash/merge')
const path = require('path')
const app = require('electron').app
const { log } = require('electron-log')

module.exports = {
  load: load
}

function load (lang) {
  var spanish = read('es')
  var locale = lang || app.getLocale()
  locale = locale.split('-')[0]
  var messages
  try {
    var translations = read(locale)
    messages = merge(spanish, translations)
  } catch (err) {
    log('Problem loading messages for locale ' + locale, err)
    log('Falling back to es locale')

    locale = 'es'
    messages = spanish
  }
  return messages
}

function read (locale) {
  var localePath = path.resolve(
    __dirname,
    '..',
    '..',
    'locales',
    locale + '.json'
  )
  return JSON.parse(fs.readFileSync(localePath, 'utf-8'))
}
