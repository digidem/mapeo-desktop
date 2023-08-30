// @ts-check
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import { BackgroundMapInfo } from '../BackgroundMaps/BackgroundMapInfo'
import { SidePanel } from '../BackgroundMaps/SidePanel'
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
  const initialMapId = null

  const [viewingMapId, setViewingMapId] = React.useState(
    /** @type {string | null} */ (initialMapId)
  )

  const { data } = useMapStylesQuery()

  function unsetViewingMap () {
    setViewingMapId(null)
  }

  const viewingMap = React.useMemo(
    () => data && data.find(m => m.id === viewingMapId),
    [data, viewingMapId]
  )

  return (
    <>
      <SidePanel
        mapValue={viewingMapId}
        openSettings={returnToSettings}
        setMapValue={setViewingMapId}
      />

      {!viewingMapId || !data ? (
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
      ) : viewingMap ? (
        <BackgroundMapInfo
          key={viewingMap.id}
          map={viewingMap}
          unsetMapValue={unsetViewingMap}
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
