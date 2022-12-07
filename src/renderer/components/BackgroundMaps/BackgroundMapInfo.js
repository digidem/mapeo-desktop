// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'
import Loading from '../Loading'
import { remote } from 'electron'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'
// import { useMapServerMutation } from '../../hooks/useMapServerMutation'

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
  deleteErrorDescription: 'There was an error deleting the style'
})

/**
 * @typedef BackgroundMapInfoProps
 * @prop {string} id
 * @prop {string} idBeingViewed
 * @prop {React.Dispatch<React.SetStateAction<string | false>>} setMapValue
 */

/** @param {BackgroundMapInfoProps} props */
export const BackgroundMapInfo = ({ id, idBeingViewed, setMapValue }) => {
  const shouldLoad = React.useMemo(() => id === idBeingViewed, [
    id,
    idBeingViewed
  ])

  const { data } = useMapServerQuery(`/styles/${id}`, shouldLoad)

  // Lazy loading each one here: aka will only load when clicked
  return shouldLoad ? (
    <Fade in={shouldLoad} timeout={600}>
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
          <MapInfo backgroundMap={data} id={id} setMapValue={setMapValue} />
        )}
      </Paper>
    </Fade>
  ) : null
}

/**
 * @typedef MapInfoProps
 * @prop {import('@mapeo/map-server/dist/lib/stylejson').StyleJSON} backgroundMap
 * @prop {string} id
 * @prop {React.Dispatch<React.SetStateAction<string | false>>} setMapValue
 */

/** @param {MapInfoProps} props */
const MapInfo = ({ backgroundMap, id, setMapValue }) => {
  const { name } = backgroundMap
  // const mutation = useMapServerMutation('delete', `/styles/${id}`)

  const classes = useStyles()

  const { formatMessage: t } = useIntl()

  const MapBox = ReactMapboxGl({
    accessToken: MAPBOX_ACCESS_TOKEN
  })

  /**
   *
   * @param {string} mapId
   */
  function deleteMap (mapId) {
    try {
      // mutation.mutate(mapId)
      // setMapValue(false)
    } catch (err) {
      remote.dialog.showErrorBox(
        t(m.deleteErrorTitle),
        t(m.deleteErrorDescription) + ': ' + err
      )
    }
  }

  return (
    <React.Fragment>
      {/* Banner */}
      <Paper className={classes.banner}>
        <Typography variant='h5'>{name}</Typography>

        <div>
          <Button variant='outlined' onClick={() => deleteMap(id)}>
            <DeleteIcon />
            <Typography style={{ textTransform: 'none' }} variant='subtitle2'>
              {t(m.deleteStyle)}
            </Typography>
          </Button>
        </div>
      </Paper>

      {/* Map */}
      <MapBox
        style={'mapbox://styles/mapbox/streets-v11'}
        containerStyle={{ height: '40%', width: '100%' }}
      />

      {/* Text under map: */}
      <div style={{ padding: 40 }}>
        {/* Title and 'Create Offline Area' button: */}
        <div className={classes.buttonContainer}>
          <Typography>{t(m.offlineAreas)}</Typography>
          <Button style={{ color: '#0066FF', textTransform: 'none' }}>
            {t(m.createOfflineArea)}
          </Button>
        </div>
      </div>
    </React.Fragment>
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
    padding: '10px 20px'
  },
  textBanner: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  offlineCardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly'
  }
})
