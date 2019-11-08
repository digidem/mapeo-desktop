const { action } = require('@storybook/addon-actions')
const through = require('through2')
const concat = require('concat-stream')
const FileSaver = require('file-saver')

module.exports = filepath => {
  const stream = through()
  stream.pipe(
    concat(data => {
      action('fs.createWriteStream')(filepath)
      const blob = new Blob([data.buffer], { type: 'application/octet-stream' })
      FileSaver.saveAs(blob, filepath)
    })
  )
  return stream
}
