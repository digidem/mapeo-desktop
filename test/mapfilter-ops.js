const test = require('tape')

const setup = require('./setup')
const {
  waitForMapFilter
} = require('./utils')

test('mapfilter-ops: edit feature textarea properly updates observation', function (t) {
  t.timeoutAfter(20e3)
  const app = setup.createApp()
  setup.waitForLoad(app, t)
    .then(() => waitForMapFilter(app))
    .then(() => app.client.click('button[role="tab"]:first-of-type + button'))
    .then(() => setup.wait())
    .then(() => app.client.click('img'))
    .then(() => app.client.waitUntilTextExists('table', 'Notes'))
    .then(() => app.client.click('button#FeatureDetail-edit'))
    /** TODO: edit observation test
     * .then(() => app.client.waitUntilTextExists('div[role="dialog"]', 'DELETE'))
    .then(() => app.client.setValue('textarea[type="text"]', 'i am a new note'))
    .then(() => app.client.waitUntilTextExists('div[role="dialog"]', 'SAVE'))
    .then(() => app.client.click('button#FeatureDetail-save-edit'))
    .then(() => app.client.waitUntilTextExists('table', 'i am a new note'))
    .then(() => app.client.waitUntilTextExists('div[role="dialog"]', 'CLOSE'))
    .then(() => app.client.click('button#FeatureDetail-close'))
    **/
    .then(() => setup.endTest(app, t),
      (err) => setup.endTest(app, t, err || 'error'))
})
