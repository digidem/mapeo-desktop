const fs = require('fs')
const merge = require('lodash/merge')
const path = require('path')
const app = require('electron').app;

var log = require('../lib/log').Node()

module.exports =  {
  load: load
}

function load (lang) {
  var english = read('en')
  var locale = lang || app.getLocale()
  locale = locale.split('-')[0]
  var messages
  try {
    var translations = read(locale)
    messages = merge(english, translations)
  } catch (err) {
    log('Problem loading messages for locale ' + locale, err)
    log('Falling back to en locale')

    locale = 'en';
    messages = english;
  }
  return messages
}

function read (locale) {
  var localePath = path.join(__dirname, '..', '..', 'locales', locale + '.json')
  return JSON.parse(fs.readFileSync(localePath, 'utf-8'));
}
