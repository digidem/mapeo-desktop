const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.invoke('CLOSING:get-message').then(updateDom)
  ipcRenderer.on('CLOSING:update-message', (ev, message) => updateDom(message))
})

function updateDom (message) {
  const closingH1 = document.getElementById('closingText')
  if (closingH1) closingH1.textContent = message
}
