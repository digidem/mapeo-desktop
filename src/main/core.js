const os = require('os')
const path = require('path')
const MapeoCore = require('@mapeo/core')
const randombytes = require('randombytes')
const sublevel = require('subleveldown')

const installStatsIndex = require('./osm-stats')

module.exports = function (argv) {
  var opts = {
    id: 'MapeoDesktop_' + randombytes(8).toString('hex'),
    writeFormat: 'osm-p2p-syncfile',
    deviceType: 'desktop'
  }

  var mapeo = new MapeoCore(argv.datadir, path.join(argv.datadir, 'media'), opts)
  // hostname often includes a TLD, which we remove
  const computerName = (os.hostname() || 'Mapeo Desktop').split('.')[0]
  mapeo.sync.setName(computerName)

  var idb = sublevel(mapeo.osm.index, 'stats')
  mapeo.osm.core.use('stats', installStatsIndex(idb))

  return mapeo
}
