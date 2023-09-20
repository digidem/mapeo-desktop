// @ts-check
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import { BackgroundMapInfo } from '../BackgroundMaps/BackgroundMapInfo'
import { SidePanel } from '../BackgroundMaps/SidePanel'
import { useMapStylesQuery } from '../../hooks/useMapStylesQuery'

const m = defineMessages({
  // Title for description of offline maps
  mapBackgroundTitle: 'Managing Map Backgrounds and Offline Areas',
  // Text introducing the Background Maps feature
  introText:
    'The Background Map in Mapeo is displayed on the observation screen and is used as a background for the observations you collect. This new pilot feature allows you to add your own custom maps and switch between multiple maps. Background Maps is currently an advanced feature - an existing map file in .mbtiles format is required for testing'
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
          <Typography variant='h4' style={{ marginBottom: 24 }}>
            {t(m.mapBackgroundTitle)}
          </Typography>

          <Typography variant='body1'>{t(m.introText)}</Typography>
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
