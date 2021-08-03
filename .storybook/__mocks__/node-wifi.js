const { action } = require('@storybook/addon-actions')
const through = require('through2')
const concat = require('concat-stream')
const FileSaver = require('file-saver')

module.exports = {
  init: () => {
    action('init')()
  },
  getCurrentConnections: () => {
    action('getCurrentConnections')(filepath)
    return Promise.resolve([{ ssid: 'TEST_SSID', quality: 70 }])
  }
}
