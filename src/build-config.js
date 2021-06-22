const pkg = require('../package.json')

module.exports = {
  variant: pkg.variant || 'main',
  version: pkg.version
}
