// @ts-check
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import { BackgroundMapInfo } from '../BackgroundMaps/BackgroundMapInfo'
import { SidePanel } from '../BackgroundMaps/SidePanel'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'

const m = defineMessages({
  // Title for description of offline maps
  mapBackgroundTitle: 'Managing Map Backgrounds and Offline Areas'
})

/** @typedef {import('../../hooks/useMapServerQuery').MapServerStyleInfo} MapServerStyleInfo */

/**
 * @typedef BackgroundMapsProps
 * @prop {()=>void} openSettings
 */

/** @param {BackgroundMapsProps} param */
export const BackgroundMaps = ({ openSettings }) => {
  const { formatMessage: t } = useIntl()

  /** @type {MapServerStyleInfo[]|false} */
  const initialMapState = /** {const} */ (false)

  /** @type {MapServerStyleInfo['id']|false} */
  const initialMapId = /** {const} */ (false)

  const [mapValue, setMapValue] = React.useState(initialMapId)

  const { data, isFetching, error } = useMapServerQuery('/styles')

  return (
    <React.Fragment>
      <SidePanel
        mapValue={mapValue}
        offlineMaps={data || false}
        openSettings={openSettings}
        setMapValue={setMapValue}
        isFetching={isFetching}
        error={error}
      />

      {!mapValue || !data ? (
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
        <React.Fragment>
          {data.map(offlineMap => (
            <BackgroundMapInfo
              key={offlineMap.id}
              idBeingViewed={mapValue}
              id={offlineMap.id}
              setMapValue={setMapValue}
            />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
