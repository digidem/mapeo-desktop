// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Loading from '../Loading'

const m = defineMessages({
  // Title for Offline Areas
  offlineAreas: 'Offline Areas',
  // Button to create an offline area
  createOfflineArea: 'Create Offline Area'
})

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
      setTimeout(() => setInfo('Map Title: ' + mapId), 1000)
    }

    if (shouldLoad) {
      getMapInfo(mapId)
    }
  }, [shouldLoad, mapId])

  return shouldLoad ? (
    <Fade in={shouldLoad} timeout={600}>
      <Paper style={{ flex: 1, width: '100%', padding: !info ? 40 : 0 }}>
        {!info ? <Loading /> : <MapInfo />}
      </Paper>
    </Fade>
  ) : null
}

const MapInfo = () => {
  const classes = useStyles()

  const { formatMessage: t } = useIntl()

  return (
    <div style={{ height: '100%' }}>
      <div className={classes.imgContainer}>
        <img
          className={classes.img}
          src='https://via.placeholder.com/500'
          alt='Map'
        />
      </div>
      <div style={{ padding: 40 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography>{t(m.offlineAreas)}</Typography>
          <Button style={{ color: '#0066FF', textTransform: 'none' }}>
            {t(m.createOfflineArea)}
          </Button>
        </div>
        <div></div>
      </div>
    </div>
  )
}

const useStyles = makeStyles({
  img: {
    width: '100%',
    objectFit: 'cover',
    height: '100%'
  },
  imgContainer: {
    width: '100%',
    height: '45%'
  }
})
