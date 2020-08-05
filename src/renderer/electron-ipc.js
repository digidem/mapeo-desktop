import { ipcRenderer } from 'electron'

export default Api(ipcRenderer)

function Api (ipcRenderer) {
  return {
    addUpdateStatusListener: function (handler) {
      function onupdate (ev, serverState, info) {
        handler({ serverState, info })
      }
      ipcRenderer.on('update-status', onupdate)
      return {
        remove: () => ipcRenderer.removeListener('update-status', onupdate)
      }
    },
    checkForUpdates: function () {
      ipcRenderer.send('check-for-updates')
    },
    downloadUpdate: function () {
      ipcRenderer.send('download-update')
    },
    quitAndInstall: function () {
      ipcRenderer.send('quit-and-install')
    }
  }
}
