const test = require('tape')
const config = require('./config')

const setup = require('./setup')

let device

test('sync-observations: mapfilter opens', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.waitUntilTextExists('.mapboxgl-ctrl-attrib', 'OpenStreetMap'))
    .then((err) => t.notOk(err))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-open'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-observations: discovers wifi device, syncs observation', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitTilMap(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('.menu'))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-menu-open'))
    .then(() => app.client.click('#menu-option-2')) // sync with.. button
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-open'))
    .then(() => startMockDevice())
    .then(() => app.client.waitUntilTextExists('.info', 'WiFi'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-discovery'))
    .then(() => app.client.click('.target'))
    .then(() => app.client.waitUntilTextExists('.info', 'completed'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-complete'))
    .then(() => device.shutdown())
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-device-shutdown'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test.skip('sync-observations: view synced observation', function (t) {
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitTilMap(app))
    .then((err) => t.notOk(err))
    .then(() => setup.wait()) // waiting for auto zoom..
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-observation-view'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

function startMockDevice () {
  device = setup.createMockDevice(config.TEST_DIR_MOCK_DEVICE)
  device.turnOn(function () {
    device.createMockData(1000, function (err, body) {
      if (err) throw err
      device.openSyncScreen()
    })
  })
}

function waitTilMap (app) {
  app.client.waitUntilTextExists('.mapboxgl-ctrl-attrib', 'OpenStreetMap')
}
