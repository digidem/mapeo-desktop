module.exports = {
  remote: {
    dialog: {
      showSaveDialog: (opts, cb) => cb('stubbed-filename')
    }
  }
}
