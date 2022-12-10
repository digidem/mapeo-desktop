// @ts-check
import * as React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles, Typography } from '@material-ui/core'
import { useIntl, defineMessages } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'

const m = defineMessages({
  // Abbreviation for megabytes
  mb: 'MB',
  // indicates how many offline areas
  areas: 'offline areas'
})

/**
 * @typedef MapCardProps
 * @prop {import('../Settings/BackgroundMaps').MapServerStyleInfo} offlineMap
 * @prop {React.Dispatch<React.SetStateAction<import('../Settings/BackgroundMaps').MapServerStyleInfo['id'] | false>>} setMap
 * @prop {import('../Settings/BackgroundMaps').MapServerStyleInfo['id'] |false } mapBeingViewed
 */

/** @param {MapCardProps} param */
export const MapCard = ({ offlineMap, setMap, mapBeingViewed }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  const isBeingViewed = React.useMemo(() => offlineMap.id === mapBeingViewed, [
    offlineMap,
    mapBeingViewed
  ])

  const Mapbox = React.useMemo(
    () =>
      ReactMapboxGl({
        accessToken: MAPBOX_ACCESS_TOKEN,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: false,
        injectCSS: false,
        interactive: false
      }),
    []
  )

  return (
    <Button
      variant='outlined'
      className={classes.root}
      onClick={() => setMap(offlineMap.id)}
    >
      <div
        className={classes.inner}
        style={{ backgroundColor: !isBeingViewed ? '#CCCCD6' : '#0066FF' }}
      >
        <div style={{ width: '30%' }}>
          <Mapbox
            containerStyle={{
              height: '100%',
              width: '100%'
            }}
            style={offlineMap.url}
          />
        </div>
        <div className={classes.text}>
          <Typography>{offlineMap.name}</Typography>
          <Typography variant='subtitle1'>
            {offlineMap.bytesStored} {t(m.mb)}
          </Typography>
        </div>
      </div>
    </Button>
  )
}

const useStyles = makeStyles({
  root: {
    height: 90,
    width: '90%',
    marginBottom: 20,
    textTransform: 'none',
    padding: 0,
    '& .MuiButton-root': {
      padding: 0
    },
    '& .MuiButton-outlined': {
      padding: 0
    },
    '& .MuiButton-label': {
      height: '100%'
    }
  },
  inner: {
    display: 'flex',
    flex: 1,
    height: '100%'
  },
  text: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    marginLeft: 10
  }
})
