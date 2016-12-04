var http = require('http')

module.exports = function (osm) {
  var httpServer = http.createServer(function (req, res) {
    console.error(req.method, req.url)

    error(404, res, 'Not Found')
  })

  return httpServer
}

function error (code, res, err) {
  res.statusCode = code
  res.end((err.message || err) + '\n')
}
