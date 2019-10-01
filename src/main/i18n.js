const { EventEmitter } = require('events')
const { app } = require('electron')
const logger = require('electron-timber')

const translations = {
  en: require('../../locales/en.json'),
  es: require('../../locales/es.json'),
  pt: require('../../locales/pt.json')
}

// defaultLocale is the default local of the app, not the user's locale.
class I18n extends EventEmitter {
  constructor (defaultLocale = 'en') {
    super()
    this.defaultLocale = defaultLocale
    this.setLocale(app.getLocale())
    this.t = this.formatMessage.bind(this)
  }

  // FormatMessage that behaves like react-intl formatMessage.
  // If needed we can extend this function with Intl MessageFormat from
  // formatJS (which powers react-intl) but I don't think we need plurals
  // or to fill in values in the main process yet.
  formatMessage ({ id, defaultMessage }) {
    const locale = this.locale
    const messages = translations[locale] || translations[this.genericLocale]
    if (!messages) {
      logger.log('No translations for locale "' + locale + '"')
      return defaultMessage || '[No translation]'
    }
    if (!messages[id]) {
      logger.log('No translations for me "' + locale + '"')
      return defaultMessage || '[No translation]'
    }
  }

  setLocale (newLocale = this.defaultLocale) {
    this.locale = newLocale
    this.enericLocale = newLocale.split('-')[0]
    this.emit('locale-change', newLocale)
  }
}

module.exports = new I18n('en')
