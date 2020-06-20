const logger = require('../logger')
const wifi = require('node-wifi')

const INTERVAL = 2000 // refresh every 2 seconds

class WifiStatus {
  constructor () {
    this.wifiInit = true
    try {
      wifi.init()
    } catch (e) {
      logger.error('Failed to init node-wifi', e)
      this.wifiInit = false
    }
    this.intervalCheck = null
  }

  start (cb) {
    this.intervalCheck = setInterval(() => {
      this.getCurrentConnections(cb)
    }, INTERVAL)
  }

  stop () {
    clearInterval(this.intervalCheck)
  }

  async getCurrentConnections (cb) {
    if (!this.wifiInit) return cb(new Error('Failed to init node-wifi'))
    try {
      const conn = await wifi.getCurrentConnections()
      cb(null, conn && conn[0])
    } catch (err) {
      logger.error('Failed to get current connections', err)
      cb(err)
    }
  }
}

module.exports = WifiStatus
