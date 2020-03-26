const { EventEmitter } = require('events')
const { app } = require('electron')
const logger = require('electron-timber')

const translations = {
  en: require('../../messages/main/en.json'),
  es: require('../../messages/main/es.json'),
  pt: require('../../messages/main/pt.json')
}

// defaultLocale is the default local of the app, not the user's locale.
class I18n extends EventEmitter {
  constructor (defaultLocale = 'en') {
    super()
    this.locale = defaultLocale
    this.defaultLocale = defaultLocale
    this.t = this.formatMessage.bind(this)
  }

  // FormatMessage that behaves like react-intl formatMessage.
  // If needed we can extend this function with Intl MessageFormat from
  // formatJS (which powers react-intl) but I don't think we need plurals
  // or to fill in values in the main process yet.
  formatMessage (id) {
    const locale = this.locale
    const messages =
      translations[locale] ||
      translations[this.genericLocale] ||
      translations[this.defaultLocale]
    if (!messages) {
      logger.log('No translations for locale "' + locale + '"')
      return '[No translation]'
    }
    const message =
      (translations[locale] && translations[locale][id]) ||
      (translations[this.genericLocale] &&
        translations[this.genericLocale][id]) ||
      (translations[this.defaultLocale] && translations[this.defaultLocale][id])
    if (!message) {
      logger.log(`No translations for '${id}' in locale '${locale}'`)
      return '[No translation]'
    }
    return message
  }

  setLocale (newLocale = this.defaultLocale) {
    logger.log('Changing locale to [' + newLocale + ']')
    this.locale = newLocale
    this.genericLocale = newLocale.split('-')[0]
    this.emit('locale-change', newLocale)
  }
}

const i18n = new I18n('en')
module.exports = i18n

app.once('ready', () => {
  i18n.setLocale(app.getLocale())
})
