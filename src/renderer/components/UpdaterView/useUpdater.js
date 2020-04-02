import { STATES } from './'
import electronIpc from '../../electron-ipc'
import { useEffect, useState } from 'react'

export default function useUpdater () {
  const [update, setUpdate] = useState({
    progress: null,
    updateInfo: null,
    state: STATES.IDLE
  })

  useEffect(
    () => {
      const updateListener = electronIpc.addUpdateStatusListener(({ serverState, info }) => {
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
            setUpdate({
              updateInfo: {
                version: info.version,
                releaseDate: info.releaseDate,
                size: info.files.map((file) => file.size).reduce((a, b) => a + b, 0)
              },
              progress: null,
              state: STATES.AVAILABLE
            })
        }
      })
      return () => {
        if (updateListener) updateListener.remove()
      }
    }
    , [])

  return [update, setUpdate]
}
