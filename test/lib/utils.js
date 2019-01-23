const config = require('./config')
const setup = require('./setup')

module.exports = {
  startMockDevice,
  waitForMapEditor,
  waitForMapFilter
}

function startMockDevice (count) {
  var device = setup.createMockDevice(config.TEST_DIR_MOCK_DEVICE)
  device.turnOn(function () {
    device.createMockData(count, function (err, body) {
      if (err) throw err
      device.openSyncScreen()
    })
  })
  return device
}

function waitForMapFilter (app) {
  return app.client.waitUntilTextExists('.mapboxgl-ctrl-attrib', 'OpenStreetMap', 1000)
}

function waitForMapEditor (app) {
  return app.client.waitUntilTextExists('.attribution', 'Feedback & Contribute', 1000)
}
