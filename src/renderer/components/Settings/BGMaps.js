// @ts-check
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import { BGMapInfo } from '../BackgroundMaps/BGMapInfo'
import { SidePanel } from '../BackgroundMaps/SidePanel'

const m = defineMessages({
  // Title for description of offline maps
  mapBackgroundTitle: 'Managing Map Backgrounds and Offline Areas'
})

/** @typedef {{mapId:string, mapTitle:string, size:number, offlineAreaCount:number, styleJson:import('mapbox-gl').Style}} OfflineMap */

/**
 * @typedef BGMapsProps
 * @prop {()=>void} openSettings
 */

/** @param {BGMapsProps} param */
export const BGMaps = ({ openSettings }) => {
  const { formatMessage: t } = useIntl()

  /** @type {OfflineMap[]|false} */
  const initialMapState = /** {const} */ (false)

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
          offlineAreaCount: 10,
          styleJson: { layers: [], sources: {}, version: 1 }
        },
        {
          mapId: '2',
          mapTitle: 'Map 2',
          size: 200,
          offlineAreaCount: 20,
          styleJson: { layers: [], sources: {}, version: 1 }
        }
      ]
    }

    setOfflineMaps(getListOfOfflineMaps())
  }, [])

  return (
    <React.Fragment>
      <SidePanel
        mapValue={mapValue}
        offlineMaps={offlineMaps}
        openSettings={openSettings}
        setMapValue={setMapValue}
      />

      {!mapValue || !offlineMaps ? (
        <div style={{ padding: 40 }}>
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
          </Typography>
        </div>
      ) : (
        // Lazy loading each one here: aka will only load when clicked
        <React.Fragment>
          {offlineMaps.map(offlineMap => (
            <BGMapInfo
              key={offlineMap.mapId}
              mapIDBeingViewed={mapValue}
              bgMapId={offlineMap.mapId}
            />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
