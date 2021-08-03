// @ts-check
const http = require('http')
const mapRouter = require('./server')
const { listen, close } = require('../../utils/async-server')
const logger = require('../../logger')

/**
 * @param {import('../../utils/types').MapPrinterOptions} options
 * @returns {import('../../utils/types').BackgroundProcess}
 */
module.exports = function init ({ mapPrinterPort }) {
  const server = http.createServer((req, res) => {
    mapRouter.handle(req, res)
  })

  return {
    start: async () => {
      const url = await listen(server, mapPrinterPort, '127.0.0.1')
      logger.info('Map printer listening on: ' + url)
    },
    close: async () => {
      return close(server)
    },
    handlers: {}
  }
}
