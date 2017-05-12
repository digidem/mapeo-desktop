var mime = require('mime')

function serveFile (req, res, filepath, archive, next) {
  var r = archive.createFileReadStream(filepath)
  r.once('error', function (err) {
    console.error(err)
    const error = new Error('Not Found')
    error.status1Code = 404
    next(error)
  })
  res.setHeader('content-type', mime.lookup(filepath))
  r.pipe(res)
}

module.exports = function (archive, root) {
  root = root.replace(/\/$/, '') || ''
  const rootRegExp = new RegExp('^' + root + '/')
  var handler = function (req, res, next) {
    if (!req.url.startsWith(root)) return next()
    if (req.method !== 'GET') return next()
    var filepath = req.url.replace(rootRegExp, '')
    serveFile(req, res, filepath, archive, next)
  }
  return handler
}
