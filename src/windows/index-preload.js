const { ipcRenderer } = require('electron')
const middleware = require('hoist')

window.middlewareClient = new middleware.Client()
ipcRenderer.on('set-socket', (event, { name }) => {
  window.middlewareClient.connect(name)
})
