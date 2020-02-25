const test = require('tape')
const setup = require('./lib/setup')

test.onFinish(setup.deleteTestDataDir)

require('./welcome')
require('./presets')
require('./sync')
require('./mapfilter-ops')
