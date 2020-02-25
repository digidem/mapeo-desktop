const test = require('tape')
const setup = require('./lib/setup')

test('welcome: open map and load forest presets', function (t) {
  t.timeoutAfter(20e3)
  setup.resetTestDataDir()
  const app = setup.createApp()
  setup.waitForLoad(app, t, { freshStart: true })
    .then(() => setup.wait())
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
