const test = require('tape')

const setup = require('../lib/setup')
const {
  waitForMapFilter
} = require('../lib/utils')

test('mapfilter-ops: edit feature opens in mapfilter', function (t) {
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapFilter(app))
    .then(() => app.client.click('button[role="tab"]:first-of-type + button'))
    .then(() => setup.wait())
    .then(() => app.client.click('img'))
    .then(() => app.client.click('button#FeatureDetail-edit'))
    .then(() => app.client.waitUntilTextExists('button#FeatureDetail-delete', 'DELETE'))
    .then(() => app.client.waitUntilTextExists('button#FeatureDetail-save-edit', 'SAVE'))
    .then(() => app.client.click('button#FeatureDetail-save-edit'))
    .then(() => app.client.click('button#FeatureDetail-close'))
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
