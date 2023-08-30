// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined'
import CheckIcon from '@material-ui/icons/Check'
import ReactMapboxGl from 'react-mapbox-gl'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'
import Loading from '../Loading'
import { convertKbToMb } from '../SettingsView/BackgroundMaps'
import { useMapServerMutation } from '../../hooks/useMapServerMutation'
import { useBackgroundMapStore } from '../../hooks/store'

const MapboxPrevOnly = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  dragRotate: false,
  pitchWithRotate: false,
  attributionControl: false,
  injectCSS: false
})

const m = defineMessages({
  // Title for Offline Areas
  offlineAreas: 'Offline Areas',
  // Button to create an offline area
  createOfflineArea: 'Create Offline Area',
  // Button to delete style
  deleteStyle: 'Delete Style',
  // Title for error message when deleting style
  deleteErrorTitle: 'Error Deleting Style',
  // Description for error message when deleting style,
  deleteErrorDescription: 'There was an error deleting the style',
  // Zoom Level Title
  zoomLevel: 'Zoom Level: {zoom}',
  // abbreviation for megabyte
  mb: 'MB',
  // Button text for 'Use Map' button
  useMap: 'Use Map',
  // Button text for 'Use Map' button when map is selected
  currentMap: 'Current Map'
})

/**
 * @typedef {import('../../hooks/useMapServerQuery').MapServerStyleInfo & { isDefault?: boolean }} BackgroundMapInfo
 * @typedef BackgroundMapInfoProps
 * @prop {BackgroundMapInfo} map
 * @prop {()=>void} unsetMapValue
 */

/** @param {BackgroundMapInfoProps} props */
export const BackgroundMapInfo = ({ map, unsetMapValue }) => {
  const { formatMessage: t } = useIntl()

  const [mapStyle, setMapStyle] = useBackgroundMapStore(store => [
    store.mapStyle,
    store.setMapStyle
  ])

  const classes = useStyles()

  const isCurrentMap = mapStyle?.id === map.id

  console.log({ map })

  return (
    <Fade in timeout={0}>
      <Paper
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          padding: !map ? 40 : 0
        }}
      >
        {!map ? (
          <Loading />
        ) : (
          <>
            <MapInfo
              name={map.name}
              id={map.id}
              unsetMapValue={unsetMapValue}
              url={map.url}
              isDefault={map.isDefault}
            />
            {/* Text */}
            <div className={classes.paddedContainer}>
              <Typography variant='subtitle2' style={{ fontSize: 18 }}>
                {map.name}
              </Typography>
              {!map.isDefault ? (
                <Typography variant='body1'>{`${Math.round(
                  convertKbToMb(map.bytesStored)
                )} ${t(m.mb)}`}</Typography>
              ) : null}
              <Button
                variant='outlined'
                onClick={() => setMapStyle(map)}
                className={`${classes.paddedButton} ${isCurrentMap &&
                  classes.iconButton}`}
                disabled={map.id === mapStyle?.id}
              >
                <Typography
                  style={{ textTransform: 'none' }}
                  variant='subtitle2'
                >
                  {isCurrentMap ? t(m.currentMap) : t(m.useMap)}
                </Typography>
                {isCurrentMap ? <CheckIcon className={classes.icon} /> : null}
              </Button>
            </div>
          </>
        )}
      </Paper>
    </Fade>
  )
}

/**
 * @typedef MapInfoProps
 * @prop {string|null|undefined} name
 * @prop {string} id
 * @prop {()=>void} unsetMapValue
 * @prop {string} url
 * @prop {boolean | undefined} isDefault
 */

/** @param {MapInfoProps} props */
const MapInfo = ({ name, id, isDefault, unsetMapValue, url }) => {
  const classes = useStyles()

  const { formatMessage: t } = useIntl()

  const mutation = useMapServerMutation('delete', `/styles/${id}`)

  async function deleteMap () {
    await mutation.mutateAsync(null) // tc complains if no arg is passed...
  }

  return (
    <>
      {/* Banner */}
      <Paper className={classes.banner}>
        <Typography variant='h5'>{name}</Typography>

        <div>
          {!isDefault && (
            <Button variant='outlined' onClick={() => deleteMap()}>
              <DeleteIcon className={classes.icon} />
              <Typography style={{ textTransform: 'none' }} variant='subtitle2'>
                {t(m.deleteStyle)}
              </Typography>
            </Button>
          )}
        </div>
      </Paper>

      {/* Map */}
      <MapboxPrevOnly
        style={url}
        containerStyle={{ height: '60%', width: '100%' }}
        zoom={[0]}
      />
    </>
  )
}

const useStyles = makeStyles({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  banner: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderRadius: 0
  },
  textBanner: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  offlineCardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly'
  },
  paddedContainer: {
    padding: 20
  },
  paddedButton: {
    marginTop: 20
  },
  iconButton: {
    padding: '5px 10px 5px 15px'
  },
  icon: {
    height: 20
  }
})
