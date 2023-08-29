// @ts-check
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import { BackgroundMapInfo } from '../BackgroundMaps/BackgroundMapInfo'
import { SidePanel } from '../BackgroundMaps/SidePanel'
import { useMapServerQuery } from '../../hooks/useMapServerQuery'
import { useMapStylesQuery } from '../../hooks/useMapStylesQuery'

const m = defineMessages({
  // Title for description of offline maps
  mapBackgroundTitle: 'Managing Map Backgrounds and Offline Areas'
})

/** @typedef {import('../../hooks/useMapServerQuery').MapServerStyleInfo} MapServerStyleInfo */

/**
 * @typedef BackgroundMapsProps
 * @prop {()=>void} returnToSettings
 */

/** @param {BackgroundMapsProps} param */
export const BackgroundMaps = ({ returnToSettings }) => {
  const { formatMessage: t } = useIntl()

  /** @type {MapServerStyleInfo['id']|null} */
  const initialMapId = /** {const} */ null

  const [mapValue, setMapValue] = React.useState(initialMapId)

  const { data } = useMapStylesQuery()

  function unsetMapValue () {
    setMapValue(null)
  }

  const offlineMap = React.useMemo(
    () => data && data.find(m => m.id === mapValue),
    [data, mapValue]
  )

  return (
    <>
      <SidePanel
        mapValue={mapValue}
        openSettings={returnToSettings}
        setMapValue={setMapValue}
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
      ) : offlineMap ? (
        <BackgroundMapInfo
          key={offlineMap.id}
          size={offlineMap.bytesStored}
          id={offlineMap.id}
          unsetMapValue={unsetMapValue}
          url={offlineMap.url}
        />
      ) : null}
    </>
  )
}

/**
 *
 * @param {number} kilobyte
 * @returns {number}
 */
export const convertKbToMb = kilobyte => {
  return kilobyte / 2 ** 20
}
