const test = require('tape')
const setup = require('./setup')

test.onFinish(setup.deleteTestDataDir)

test('app runs', function (t) {
  t.timeoutAfter(10e3)
  setup.resetTestDataDir()
  const app = setup.createApp()
  setup.waitForLoad(app, t, { fresh: true })
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))

  require('./welcome')
  require('./sync-observations')
  require('./mapfilter-ops')
})
