const through = require('through2')
const concat = require('concat-stream')
const FileSaver = require('file-saver')

module.exports = {
  createWriteStream: filepath => {
    const stream = through()
    stream.pipe(
      concat(data => {
        console.log('fs.createWriteStream', filepath)
      })
    )
    return stream
  },
  writeFile: (filepath, data, cb) => {
    console.log('fs.writeFile', filepath)
    const blob = new Blob([data], { type: 'application/octet-stream' })
    FileSaver.saveAs(blob, filepath)
    cb()
  },
  readFileSync: filepath => {
    console.log('fs.readFileSync', filepath)
  }
}
