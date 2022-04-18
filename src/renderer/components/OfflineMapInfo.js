// @ts-check
import { Fade, Paper } from '@material-ui/core'
import * as React from 'react'
import Loading from './Loading'

/**
 * @typedef OfflineMapInfoProps
 * @prop {string} mapId
 * @prop {string} currentMapId
 */

/** @param {OfflineMapInfoProps} props */
export const OfflineMapInfo = ({ mapId, currentMapId }) => {
  const shouldLoad = React.useMemo(() => mapId === currentMapId, [
    mapId,
    currentMapId
  ])

  const [info, setInfo] = React.useState(null)

  React.useEffect(() => {
    /**
     * @param {string} mapId
     */
    async function getMapInfo (mapId) {
      setTimeout(() => setInfo('Map Title: ' + mapId), 2000)
    }

    if (shouldLoad) {
      getMapInfo(mapId)
    }
  }, [shouldLoad, mapId])

  return shouldLoad ? (
    <Fade in={shouldLoad} timeout={600}>
      <Paper style={{ flex: 1, width: '100%', padding: 40 }}>
        {!info ? <Loading /> : <div>{info}</div>}
      </Paper>
    </Fade>
  ) : null
}
