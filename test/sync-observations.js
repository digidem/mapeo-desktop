const test = require('tape')

const setup = require('./setup')
const {
  waitForMapEditor,
  waitForMapFilter,
  startMockDevice
} = require('./utils')

let device

test('sync-observations: mapfilter opens', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapEditor(app))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapeditor-open'))
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapFilter'))
    .then(() => waitForMapFilter(app))
    .then(() => app.client.click('button[title="Menu"]')) // menu works going back and forth between views.
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapEditor'))
    .then(() => waitForMapEditor(app))
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapFilter'))
    .then(() => waitForMapFilter(app))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-open'))
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-menu-open'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-observations: discovers wifi device, syncs many observations', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-SyncView'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-open'))
    .then(() => {
      device = startMockDevice(1000)
    })
    .then(() => app.client.waitUntilTextExists('.info', 'WiFi'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-discovery'))
    .then(() => app.client.click('.target'))
    .then(() => app.client.waitUntilTextExists('.info', 'completed'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-complete'))
    .then(() => device.shutdown())
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-device-shutdown'))
    .then(() => app.client.click('#sync-done'))
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('button[role="tab"]:first-of-type + button'))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-media-view'))
    // .then(() => app.client.click('img'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
