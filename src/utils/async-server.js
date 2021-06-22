// @ts-check
const { promisify } = require('util')

module.exports = {
  listen,
  close
}

/**
 * Async server.listen()
 *
 * @param {import('http').Server} server
 * @param {number} port
 * @param {string} host
 * @returns {Promise<string>} URL server is listening on
 */
async function listen (server, port, host) {
  await promisify(server.listen.bind(server))(port, host)
  const addInfo = /** @type {import('net').AddressInfo} */ (server.address())
  return `http://${addInfo.address}:${addInfo.port}`
}

/**
 * Async server.close()
 *
 * @param {import('http').Server} server
 * @returns {Promise<void>}
 */
function close (server) {
  return promisify(server.close.bind(server))()
}
