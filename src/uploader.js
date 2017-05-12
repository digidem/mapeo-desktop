/* global File */
const XFormUploader = require('react-xform-uploader')
const glob = require('glob')
const fs = require('fs')
const path = require('path')

// There is a bug in Electron with file inputs and webkitDirectory
// https://github.com/electron/electron/issues/839
// It returns a single empty File with the absolute path of the selected directory
// This override reconstructs the Filelist that xformUploader expects
XFormUploader.prototype.handleFiles = function (e) {
  if (this.state.uploading) return
  glob('**/*', {cwd: e.target.files[0].path, nodir: true, absolute: true}, (err, filepaths) => {
    if (err) return console.error(err)
    filepaths.forEach(filepath => {
      const parsed = path.parse(filepath)
      const isXml = parsed.ext === '.xml'
      fs.readFile(filepath, isXml ? 'utf8' : null, (err, data) => {
        if (err) return console.error(err)
        const file = new File([data], parsed.base)
        this.uploader.add(file, err => err && console.error(err))
      })
    })
  })
}

module.exports = XFormUploader
