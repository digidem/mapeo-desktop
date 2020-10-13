const { action } = require('@storybook/addon-actions')
const through = require('through2')
const concat = require('concat-stream')
const FileSaver = require('file-saver')

module.exports = {
  createWriteStream: filepath => {
    const stream = through()
    stream.pipe(
      concat(data => {
        action('fs.createWriteStream')(filepath)
      })
    )
    return stream
  },
  writeFile: (filepath, data, cb) => {
    action('fs.writeFile')(filepath)
    const blob = new Blob([data], { type: 'application/octet-stream' })
    FileSaver.saveAs(blob, filepath)
    cb()
  },
  readFileSync: filepath => {
    action('fs.readFileSync')(filepath)
  }
}
