const path = require('path')

const alias = {
  fs: path.resolve(__dirname, '__mocks__/fs.js'),
  'fs-write-stream-atomic': path.resolve(
    __dirname,
    '__mocks__/fs-write-stream-atomic.js'
  ),
  electron: path.resolve(__dirname, '__mocks__/electron.js')
}

module.exports = async ({ config }) => {
  config.resolve.alias = {
    ...config.resolve.aliases,
    ...alias
  }
  return config
}
