const fakeDialog = require('spectron-fake-dialog')
const path = require('path')
const test = require('tape')

const config = require('./lib/config')
const setup = require('./lib/setup')
const {
  waitForMapEditor,
  waitForMapFilter,
  startMockDevice
} = require('./lib/utils')

const testFile = path.join(config.TEST_DIR_DOWNLOAD, 'test.mapeo-jungle')
let device

test('sync-observations: mapfilter opens', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapEditor(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapFilter'))
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('button[title="Menu"]')) // menu works going back and forth between views.
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapEditor'))
    .then(() => waitForMapEditor(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-MapFilter'))
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
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
      device = startMockDevice(5)
    })
    .then(() => app.client.waitUntilTextExists('.info', 'WiFi'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-discovery'))
    .then(() => app.client.click('.target'))
    .then(() => app.client.waitUntilTextExists('.info', 'completed'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-complete'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-sync-device-shutdown'))
    .then(() => app.client.click('#sync-done'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-observations: view synced observation', function (t) {
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
    .then(() => device.shutdown())
    .then(() => app.client.click('button[role="tab"]:first-of-type + button'))
    .then(() => setup.wait())
    .then(() => app.client.click('img'))
    .then(() => setup.wait())
    .then(() => app.client.waitUntilTextExists('table', 'ObservedBy'))
    .then(() => app.client.waitUntilTextExists('table', 'You'))
    .then(() => app.client.waitUntilTextExists('table', 'Notes'))
    .then(() => app.client.waitUntilTextExists('table', 'Location'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-file: create syncfile', function (t) {
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-SyncView'))
    .then(() => setup.wait())
    .then(() => fakeDialog.mock([{method: 'showSaveDialog', value: [testFile]}]))
    .then(() => app.client.click('#sync-new'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-file: load syncfile', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => app.client.click('button[title="Menu"]'))
    .then(() => setup.wait())
    .then(() => app.client.click('#menu-option-SyncView'))
    .then(() => setup.wait())
    .then(() => fakeDialog.mock([{method: 'showOpenDialog', value: [testFile]}]))
    .then(() => app.client.click('#sync-open'))
    .then(() => app.client.waitUntilTextExists('.info', 'completed'))
    .then(() => app.client.click('#sync-done'))
    .then(() => waitForMapFilter(app))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})

test('sync-observations: open convert dialog', function (t) {
  t.timeoutAfter(30e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('#convert-button'))
    .then(() => app.client.waitUntilTextExists('#convert-dialog', '1 observations'))
    .then(() => setup.screenshotCreateOrCompare(app, t, 'mapfilter-convert-dialog'))
    .then(() => app.client.click('#convert-submit'))
    .then(() => waitForMapFilter(app))
    .then((err) => t.notOk(err))
    .then(() => app.client.click('#convert-button'))
    .then(() => app.client.waitUntilTextExists('#convert-dialog', 'These are all already in the Map Editor'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
