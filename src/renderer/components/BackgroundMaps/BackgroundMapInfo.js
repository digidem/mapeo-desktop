// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'
import Loading from '../Loading'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'
import { DeleteMapStyleDialog } from '../dialogs/DeleteMapStyle'

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
 * @prop {string} url
 * @prop {()=>void} unsetMapValue
 */

/** @param {BackgroundMapInfoProps} props */
export const BackgroundMapInfo = ({
  id,
  idBeingViewed,
  unsetMapValue,
  url
}) => {
  const shouldLoad = React.useMemo(() => id === idBeingViewed, [
    id,
    idBeingViewed
  ])

  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)

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
          <React.Fragment>
            <MapInfo
              name={data.name}
              openDialog={() => setDialogIsOpen(true)}
              url={url}
            />

            <DeleteMapStyleDialog
              close={() => setDialogIsOpen(false)}
              name={data.name}
              open={dialogIsOpen}
              unsetMapValue={unsetMapValue}
              id={id}
            />
          </React.Fragment>
        )}
      </Paper>
    </Fade>
  ) : null
}

/**
 * @typedef MapInfoProps
 * @prop {string|undefined} name
 * @prop {string} url
 * @prop {()=>void} openDialog
 */

/** @param {MapInfoProps} props */
const MapInfo = ({ name, url, openDialog }) => {
  const classes = useStyles()

  const { formatMessage: t } = useIntl()

  const MapBox = ReactMapboxGl({
    accessToken: MAPBOX_ACCESS_TOKEN
  })

  return (
    <React.Fragment>
      {/* Banner */}
      <Paper className={classes.banner}>
        <Typography variant='h5'>{name}</Typography>

        <div>
          <Button variant='outlined' onClick={openDialog}>
            <DeleteIcon />
            <Typography style={{ textTransform: 'none' }} variant='subtitle2'>
              {t(m.deleteStyle)}
            </Typography>
          </Button>
        </div>
      </Paper>

      {/* Map */}
      <MapBox style={url} containerStyle={{ height: '60%', width: '100%' }} />
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
