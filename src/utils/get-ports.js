const getPort = require('get-port')

module.exports = getPorts

/**
 * Get multiple open ports from list of preferred ports
 *
 * @param {number[]} ports
 * @returns {number[]}
 */
async function getPorts (ports) {
  if (new Set(ports).size !== ports.length) {
    throw new Error('Duplicate ports: ' + ports.join(', '))
  }
  return Promise.all(ports.map(port => getPort({ port })))
}
