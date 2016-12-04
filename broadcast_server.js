var randombytes = require('randombytes')
var wsock = require('websocket-stream')
var eos = require('end-of-stream')

module.exports = createBroadcastServer

// Create a websocket-backed server that can broadcast messages to its connected clients.
// Returns the function 'broadcast(topic, msg)'.
function createBroadcastServer (httpServer) {
  var streams = {}

  wsock.createServer({ server: httpServer }, function (stream) {
    var id = randombytes(8).toString('hex')
    streams[id] = stream
    eos(stream, function () { delete streams[id] })
  })

  return send

  function send (topic, msg) {
    var str = JSON.stringify({ topic: topic, message: msg || {} }) + '\n'
    Object.keys(streams).forEach(function (id) {
      streams[id].write(str)
    })
  }
}

