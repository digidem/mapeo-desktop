import { useEffect, useState } from 'react'

import semver from 'semver'
import { version as appVersion } from '../../../build-config'
import STATES from './states'
import electronIpc from '../../electron-ipc'

export default function useUpdater () {
  const [update, setUpdate] = useState({
    progress: null,
    updateInfo: null,
    state: STATES.IDLE
  })

  useEffect(() => {
    const updateListener = electronIpc.addUpdateStatusListener(
      ({ serverState, info }) => {
        switch (serverState) {
          case 'update-error':
            setUpdate({
              updateInfo: info,
              progress: null,
              state: STATES.ERROR
            })
            return
          case 'update-downloaded':
            setUpdate({
              updateInfo: null,
              progress: null,
              state: STATES.READY_FOR_RESTART
            })
            return
          case 'update-not-available':
            setUpdate({
              updateInfo: null,
              progress: null,
              state: STATES.UPDATE_NOT_AVAILABLE
            })
            return
          case 'update-progress':
            setUpdate({
              progress: info.progress,
              state: STATES.PROGRESS
            })
            return
          case 'update-available':
            var past = semver.parse(appVersion)
            var next = semver.parse(info.version)
            info.major = next.major > past.major
            info.minor = next.minor > past.minor
            info.patch = next.patch > past.patch

            info.size = info.files
              .map(file => file.size)
              .reduce((a, b) => a + b, 0)

            setUpdate({
              updateInfo: info,
              progress: null,
              state: STATES.AVAILABLE
            })
            return
          case 'update-inactive':
            setUpdate({
              progress: null,
              updateInfo: null,
              state: STATES.UPDATE_INACTIVE
            })
        }
      }
    )
    return () => {
      if (updateListener) updateListener.remove()
    }
  }, [])

  function downloadUpdate () {
    setUpdate({
      state: STATES.DOWNLOADING
    })
    electronIpc.downloadUpdate()
  }

  return [update, { downloadUpdate }]
}
