const ipc = require('node-ipc')

function init (socketName, handlers) {
  ipc.config.id = socketName
  ipc.config.silent = true
  console.log('init background', socketName, handlers)

  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      const msg = JSON.parse(data)
      const { id, name, args } = msg
      console.log('got message', data, socket)

      if (handlers[name]) {
        handlers[name](args).then(
          result => {
            ipc.server.emit(
              socket,
              'message',
              JSON.stringify({ type: 'reply', id, result })
            )
          },
          error => {
            // Up to you how to handle errors, if you want to forward
            // them, etc
            ipc.server.emit(
              socket,
              'message',
              JSON.stringify({ type: 'error', id })
            )
            throw error
          }
        )
      } else {
        console.warn('Unknown method: ' + name)
        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({ type: 'reply', id, result: null })
        )
      }
    })
  })

  ipc.server.start()
}

function send (name, args) {
  console.log('sending', name, args)
  ipc.server.broadcast('message', JSON.stringify({ type: 'push', name, args }))
}

module.exports = { init, send }
