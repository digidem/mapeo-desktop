// @ts-check
import { Button, Fade, makeStyles, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined'

import { MAPBOX_ACCESS_TOKEN } from '../../../../config'
import Loading from '../Loading'
import { OfflineAreaCard } from './OfflineAreaCard'
import { remote } from 'electron'

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

/** @typedef {{id:string, size:number, zoomLevel:number, title:string}} OfflineArea */

/** @typedef {{styleId:string, styleJson:import('mapbox-gl').Style, styleTitle:string, offlineAreas:OfflineArea[]}} BGMap */

/**
 * @typedef BGMapInfoProps
 * @prop {string} bgMapId
 * @prop {string} mapIDBeingViewed
 */

/** @param {BGMapInfoProps} props */
export const BGMapInfo = ({ bgMapId, mapIDBeingViewed }) => {
  const shouldLoad = React.useMemo(() => bgMapId === mapIDBeingViewed, [
    bgMapId,
    mapIDBeingViewed
  ])

  /** @type {BGMap | null} */
  const initialBgMap = /** {const} */ (null)

  const [bgMap, setbgMap] = React.useState(initialBgMap)

  React.useEffect(() => {
    /**
     * @param {string} stylesId
     * @returns {Promise<BGMap>}
     */
    async function getMapInfo (stylesId) {
      // To do: Api Call to get map info
      return {
        styleId: bgMapId,
        styleJson: { layers: [], sources: {}, version: 1 },
        styleTitle: `Map ${bgMapId}`,
        offlineAreas: [
          {
            title: 'offline-area-1',
            size: 100,
            zoomLevel: 10,
            id: 'idMap1'
          },
          {
            title: 'offline-area-2',
            size: 200,
            zoomLevel: 20,
            id: 'idMap2'
          },
          {
            title: 'offline-area-3',
            size: 300,
            zoomLevel: 30,
            id: 'idMap3'
          }
        ]
      }
    }

    if (shouldLoad) {
      getMapInfo(bgMapId).then(styles => setbgMap(styles))
    }
  }, [shouldLoad, bgMapId])

  return shouldLoad ? (
    <Fade in={shouldLoad} timeout={600}>
      <Paper
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          padding: !bgMap ? 40 : 0
        }}
      >
        {!bgMap ? <Loading /> : <MapInfo bgMap={bgMap} />}
      </Paper>
    </Fade>
  ) : null
}

/**
 * @typedef MapInfoProps
 * @prop {BGMap} bgMap
 *
 */

/** @param {MapInfoProps} props */
const MapInfo = ({ bgMap }) => {
  const { offlineAreas, styleTitle } = bgMap

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
    // To do: Api Call to delete map
    try {
      return
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
        <Typography variant='h5'>{styleTitle}</Typography>

        <div>
          <Button variant='outlined' onClick={() => deleteMap(bgMap.styleId)}>
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

        {/* List of offline areas Card */}
        <div className={classes.offlineCardContainer}>
          {offlineAreas.map(offlineArea => (
            <OfflineAreaCard
              key={offlineArea.id}
              size={offlineArea.size}
              zoomLevel={offlineArea.zoomLevel}
              title={offlineArea.title}
            />
          ))}
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
