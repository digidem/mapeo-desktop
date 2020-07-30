const { autoUpdater } = require('electron-updater')
const events = require('events')
const fetch = require('node-fetch')

const networkSpeed = require('./network-speed')
const store = require('../store')
const logger = require('../logger')

// MapeoUpdater emits the 'error' event when there is an internal error with
// updating. We wrap electron-updater to control the API surface.
// Never use electron-updater directly in downstream modules.

const PERSISTED_STORE_KEY = 'updater.channel'
const VALID_CHANNELS = ['beta', 'latest', 'alpha']

class MapeoUpdater extends events.EventEmitter {
  constructor () {
    super()
    // Settings
    autoUpdater.channel = this.channel
    autoUpdater.autoDownload = false
    autoUpdater.logger = logger
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.allowDowngrade = false
    this._onerror = this._onerror.bind(this)

    autoUpdater.on('error', this._onerror)
  }

  get channel () {
    let channel
    try {
      channel = store.get(PERSISTED_STORE_KEY)
    } catch (err) {
      // defaults to 'latest' when unset
      channel = autoUpdater.channel
    }
    if (channel !== autoUpdater.channel) autoUpdater.channel = channel
    return channel
  }

  set channel (value) {
    if (VALID_CHANNELS.indexOf(value) === -1) {
      logger.error('[UPDATER] Invalid channel', value)
      return
    }
    store.set(PERSISTED_STORE_KEY, value)
    autoUpdater.channel = value
    logger.info('[UPDATER] Channel updated to', updater.channel)
  }

  async _getReleaseSummary (version) {
    let releaseSummary
    try {
      const baseUrl = `https://downloads.mapeo.app/desktop/${version}/SUMMARY`
      releaseSummary = await fetch(baseUrl)
    } catch (err) {
      logger.error('[UPDATER] Error getting release notes', err)
      releaseSummary = null
    }
    return releaseSummary
  }

  async _getDownloadSpeed () {
    let downloadSpeed
    try {
      downloadSpeed = await networkSpeed.download()
      logger.info('[UPDATER] Got download speed', downloadSpeed)
    } catch (err) {
      logger.error('[UPDATER] Error getting download speed', err)
      downloadSpeed = null
    }
    return downloadSpeed
  }

  updateAvailable (onupdate) {
    autoUpdater.on('update-available', async ({
      version, files, path, sha512, releaseDate
    }) => {
      var args = {
        version,
        files,
        path,
        sha512,
        releaseDate,
        downloadSpeed: this._getDownloadSpeed(),
        releaseSummary: null // TODO: this._getReleaseSummary(version)
      }

      onupdate(args)
    })
  }

  updateNotAvailable (cb) {
    autoUpdater.on('update-not-available', cb)
  }

  downloadProgress (onprogress) {
    autoUpdater.on('download-progress', (progress) => {
      logger.info('[UPDATER] Progress', progress)
      onprogress({
        progress: progress
      })
    })
  }

  updateDownloaded (cb) {
    autoUpdater.on('update-downloaded', cb)
  }

  periodicUpdates (interval) {
    const FOUR_HOURS = 1000 * 60 * 60 * 4
    setInterval(async () => {
      this.checkForUpdates()
    }, interval || FOUR_HOURS)
    this.checkForUpdates()
  }

  downloadUpdate () {
    logger.info('[UPDATER] Download initiated.')
    var promise = autoUpdater.downloadUpdate()

    promise
      .then(() => logger.error('[UPDATER] Download successful.'))
      .catch(this._onerror)
    return promise
  }

  checkForUpdates (cb) {
    if (!cb) cb = () => {}
    try {
      var promise = autoUpdater.checkForUpdates()
      promise
        .then(update => cb(null, update))
        .catch(this._onerror)
    } catch (err) {
      // TODO: error codes for internationalization.
      var error = new Error('[UPDATER] Could not check for updates.', err)
      this._onerror(error)
    }
  }

  _onerror (err) {
    logger.error('[UPDATER]', err)
    this.emit('error', err)
  }

  quitAndInstall () {
    autoUpdater.quitAndInstall()
  }
}

var updater
if (!updater) updater = new MapeoUpdater()

module.exports = updater
