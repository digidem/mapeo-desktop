const test = require('tape')

const setup = require('./setup')
const { waitForMapEditor } = require('./utils')

test('welcome: presets open map', function (t) {
  setup.resetTestDataDir()
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'welcome-screen-1'))
    .then(() => app.client.click('.next-screen'))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'welcome-screen-2'))
    .then(() => app.client.click('.next-screen'))
    .then(() => setup.wait())
    .then(() => setup.screenshotCreateOrCompare(app, t, 'welcome-screen-3'))
    .then(() => app.client.click('#use-presets'))
    .then(() => waitForMapEditor(app))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
