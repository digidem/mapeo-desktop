// @ts-check
import * as React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles, Typography, useTheme } from '@material-ui/core'
import { useIntl, defineMessages } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'
import { convertKbToMb } from '../SettingsView/BackgroundMaps'
import { useBackgroundMapStore } from '../../hooks/store'
import Chip from '@material-ui/core/Chip'

const m = defineMessages({
  // Abbreviation for megabytes
  mb: 'MB',
  // indicates how many offline areas
  areas: 'offline areas',
  // Label to indicate when map is selected
  currentMap: 'Current Map'
})

export const MapboxPrevOnly = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  interactive: false,
  injectCSS: false
})

/**
 * @typedef MapCardProps
 * @prop {import('../SettingsView/BackgroundMaps').MapServerStyleInfo & { isDefault?: boolean }} mapStyle
 * @prop {React.Dispatch<React.SetStateAction<import('../SettingsView/BackgroundMaps').MapServerStyleInfo['id'] | null>>} setMap
 * @prop {boolean } isBeingViewed
 */

/** @param {MapCardProps} param */
export const MapCard = ({ mapStyle, setMap, isBeingViewed }) => {
  const theme = useTheme()
  const selectedMapStyle = useBackgroundMapStore(store => store.mapStyle)
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  return (
    <Button
      variant='outlined'
      className={classes.root}
      onClick={() => setMap(mapStyle.id)}
    >
      <div
        className={classes.inner}
        style={{
          backgroundColor: !isBeingViewed
            ? '#CCCCD6'
            : theme.palette.primary.main
        }}
      >
        <div style={{ width: '30%' }}>
          <MapboxPrevOnly
            containerStyle={{
              height: '100%',
              width: '100%'
            }}
            style={mapStyle.url}
            zoom={[0]}
            center={[-77, 0]}
          />
        </div>
        <div className={classes.text}>
          <Typography>{mapStyle.name}</Typography>
          {!mapStyle.isDefault && (
            <Typography variant='subtitle1'>
              {`${Math.round(convertKbToMb(mapStyle.bytesStored))} ${t(m.mb)}`}
            </Typography>
          )}
        </div>
        <div className={classes.detail}>
          {selectedMapStyle?.id === mapStyle.id && (
            <Chip
              size='small'
              style={{
                backgroundColor: isBeingViewed
                  ? 'white'
                  : theme.palette.primary.main,
                color: isBeingViewed ? theme.palette.text.primary : 'white'
              }}
              label={t(m.currentMap)}
            />
          )}
        </div>
      </div>
    </Button>
  )
}

const useStyles = makeStyles({
  root: {
    minHeight: '90px',
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
  },
  detail: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 8
  }
})
