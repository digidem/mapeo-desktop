const { EventEmitter } = require('events')
const { app } = require('electron')
const logger = require('../logger')
const store = require('../persist-store')

const translations = {
  en: require('../../messages/main/en.json'),
  es: require('../../messages/main/es.json'),
  fr: require('../../messages/main/fr.json'),
  pt: require('../../messages/main/pt.json'),
  th: require('../../messages/main/th.json'),
  vi: require('../../messages/main/vi.json'),
  km: require('../../messages/main/km.json'),
}

// We only support generalized locales for now (i.e., no difference between
// Spanish/Espana and Spanish/Latin America)
function getSystemLocale () {
  return app.getLocale().substr(0, 2)
}

// defaultLocale is the default local of the app, not the user's locale.
class I18n extends EventEmitter {
  constructor (defaultLocale = 'en') {
    super()
    this.locale = defaultLocale
    this.defaultLocale = defaultLocale
    logger.info('Locale', this.locale)
    this.t = this.formatMessage.bind(this)
  }

  // FormatMessage that behaves like react-intl formatMessage.
  // If needed we can extend this function with Intl MessageFormat from
  // formatJS (which powers react-intl) but I don't think we need plurals
  // or to fill in values in the main process yet.
  formatMessage (id) {
    const locale = this.locale
    const messages =
      translations[locale] || translations[this.genericLocale] || translations[this.defaultLocale]
    if (!messages) {
      logger.debug('No translations for locale "' + locale + '"')
      return '[No translation]'
    }
    const message =
      (translations[locale] && translations[locale][id]) ||
      (translations[this.genericLocale] && translations[this.genericLocale][id]) ||
      (translations[this.defaultLocale] && translations[this.defaultLocale][id])
    if (!message) {
      logger.debug(`No translations for '${id}' in locale '${locale}'`)
      return '[No translation]'
    }
    return message
  }

  setLocale (newLocale) {
    if (!newLocale || newLocale.length !== 2)
      return logger.error(
        new Error('Tried to set locale and failed, must be a 2 character string', newLocale),
      )
    logger.info('Changing locale to', newLocale)
    this.locale = newLocale
    this.genericLocale = newLocale.split('-')[0]
    this.emit('locale-change', newLocale)
  }

  save (locale = this.locale) {
    store.set('locale', locale)
  }

  load () {
    try {
      return store.get('locale')
    } catch (err) {
      logger.error('Failed to load locale from app settings')
      return null
    }
  }
}

const i18n = new I18n('en')
module.exports = i18n

app.once('ready', () => {
  var locale = i18n.load()
  if (!locale) {
    locale = getSystemLocale()
    logger.info('Using system locale')
  }
  i18n.setLocale(locale)
})
