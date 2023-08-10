// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined'
import CheckIcon from '@material-ui/icons/Check'

import Loading from '../Loading'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'
import { MapboxPrevOnly } from './MapCard'
import { convertKbToMb } from '../SettingsView/BackgroundMaps'
import { useMapServerMutation } from '../../hooks/useMapServerMutation'
import { useBackgroundMapStore } from '../../hooks/store'

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
 * @typedef BackgroundMapInfoProps
 * @prop {string} id
 * @prop {string} url
 * @prop {number} size
 * @prop {()=>void} unsetMapValue
 */

/** @param {BackgroundMapInfoProps} props */
export const BackgroundMapInfo = ({ id, unsetMapValue, url, size }) => {
  const { formatMessage: t } = useIntl()

  const [mapStyle, setMapStyle] = useBackgroundMapStore(store => [
    store.mapStyle,
    store.setMapStyle
  ])

  const { data } = useMapServerQuery(`/styles/${id}`)
  const classes = useStyles()

  const isCurrentMap = mapStyle === id

  return (
    <Fade in timeout={0}>
      <Paper
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          padding: !data ? 40 : 0
        }}
      >
        {!data ? (
          <Loading />
        ) : (
          <>
            <MapInfo
              name={data.name}
              id={id}
              unsetMapValue={unsetMapValue}
              url={url}
            />
            {/* Text */}
            <div className={classes.paddedContainer}>
              <Typography variant='subtitle2' style={{ fontSize: 18 }}>
                {data.name}
              </Typography>
              {data.zoom && (
                <Typography variant='body1'>
                  {t(m.zoomLevel, { zoom: data.zoom })}
                </Typography>
              )}
              <Typography variant='body1'>{`${Math.round(
                convertKbToMb(size)
              )} ${t(m.mb)}`}</Typography>
              <Button
                variant='outlined'
                onClick={() => setMapStyle(id)}
                className={`${classes.paddedButton} ${isCurrentMap &&
                  classes.iconButton}`}
                disabled={id === mapStyle}
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
 * @prop {string|undefined} name
 * @prop {string} id
 * @prop {()=>void} unsetMapValue
 * @prop {string} url
 */

/** @param {MapInfoProps} props */
const MapInfo = ({ name, id, unsetMapValue, url }) => {
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
          <Button variant='outlined' onClick={() => deleteMap()}>
            <DeleteIcon className={classes.icon} />
            <Typography style={{ textTransform: 'none' }} variant='subtitle2'>
              {t(m.deleteStyle)}
            </Typography>
          </Button>
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
