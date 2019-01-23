const test = require('tape')
const setup = require('./lib/setup')

test.onFinish(setup.deleteTestDataDir)

test('app runs', function (t) {
  t.timeoutAfter(10e3)
  setup.resetTestDataDir()
  const app = setup.createApp()
  setup.waitForLoad(app, t, { test: true })
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))

  require('./tests/welcome')
  require('./tests/presets')
  require('./tests/sync-observations')
  require('./tests/mapfilter-ops')
})
