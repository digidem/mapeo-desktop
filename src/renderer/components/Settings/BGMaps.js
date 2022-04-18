// @ts-check
import * as React from 'react'
import Button from '@material-ui/core/Button'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import { makeStyles } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'
import Loader from '../../components/Loader'

import { MapCard } from '../MapCard'
import { OfflineMapInfo } from '../OfflineMapInfo'

const m = defineMessages({
  // Button to add map background
  addMap: 'Add Map Background',
  // Button to create an offline area for a map backgroun
  createOfflineMap: 'Create Offline Map',
  // Title for description of offline maps
  mapBackgroundTitle: 'Managing Map Backgrounds and Offline Areas',
  // button to go back to settings
  backToSettings: 'Back to Settings'
})

const useStyles = makeStyles({
  sidePanel: {
    width: 'auto',
    borderRight: '1px solid #E0E0E0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '35%'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20
  },
  button: {
    textTransform: 'none'
  },
  firstButton: {
    marginRight: 10
  },
  noMapContainer: {
    padding: 40
  },
  backHeader: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
    display: 'flex',
    textTransform: 'none',
    '& :first-child': {
      marginRight: 20
    }
  }
})

/** @typedef {{mapId:string, mapTitle:string, size:number, offlineAreaCount:number}} OfflineMap */

/**
 * @typedef BGMapsProps
 * @prop {React.Dispatch<React.SetStateAction<import('.').SettingsTabs['tabId'] | false>>} setCurrentTab
 */

/** @param {BGMapsProps} param */
export const BGMaps = ({ setCurrentTab }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  /** @type {OfflineMap[]} */
  const initialMapState = /** {const} */ undefined

  const [offlineMaps, setOfflineMaps] = React.useState(initialMapState)

  /** @type {OfflineMap['mapId']|false} */
  const initialMapId = /** {const} */ (false)

  const [mapValue, setMapValue] = React.useState(initialMapId)

  React.useEffect(() => {
    // To Do: API call to get map value
    /**
     * @returns {OfflineMap[]}
     */
    function getListOfOfflineMaps () {
      return [
        {
          mapId: '1',
          mapTitle: 'Map 1',
          size: 100,
          offlineAreaCount: 10
        },
        {
          mapId: '2',
          mapTitle: 'Map 2',
          size: 200,
          offlineAreaCount: 20
        }
      ]
    }

    setOfflineMaps(getListOfOfflineMaps())
  }, [])

  return (
    <React.Fragment>
      <div className={classes.sidePanel}>
        <Button
          onClick={() => setCurrentTab(false)}
          className={classes.backHeader}
        >
          <ChevronLeft />
          {t(m.backToSettings)}
        </Button>
        <div className={classes.buttonContainer}>
          <Button
            className={`${classes.button} ${classes.firstButton}`}
            variant='outlined'
          >
            {t(m.addMap)}
          </Button>
          <Button className={classes.button} variant='outlined'>
            {t(m.createOfflineMap)}
          </Button>
        </div>

        {offlineMaps === undefined ? (
          <Loader />
        ) : (
          offlineMaps.map(offlineMap => (
            <MapCard
              // @ts-ignore JSDOC sucks
              setMap={setMapValue}
              key={offlineMap.mapId}
              offlineMap={offlineMap}
              mapBeingViewed={mapValue}
            />
          ))
        )}
      </div>

      {!mapValue ? (
        <div className={classes.noMapContainer}>
          <Typography variant='h4'> {t(m.mapBackgroundTitle)}</Typography>

          <Typography variant='body1'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
            <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
            <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Typography>
        </div>
      ) : (
        //    Lazy loading each one here: aka will only load when clicked
        <React.Fragment>
          {offlineMaps.map(offlineMap => (
            <OfflineMapInfo
              key={offlineMap.mapId}
              currentMapId={mapValue}
              mapId={offlineMap.mapId}
            />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
