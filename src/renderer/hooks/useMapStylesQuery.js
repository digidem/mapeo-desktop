// @ts-check
import { useBackgroundMapStore, useExperimentsFlagsStore } from './store'
import { useMapServerQuery } from './useMapServerQuery'
import { useQuery } from '@tanstack/react-query'
import api from '../new-api'
import { defineMessages, useIntl } from 'react-intl'

// Randomly generated, but should not change, since this is stored in settings
// if the user selects one of these "legacy" map styles
const DEFAULT_MAP_ID = '487x2pc8ws801avhs5hw58qnxc'
const CUSTOM_MAP_ID = 'vg4ft8yvzwfedzgz1dz7ntneb8'
const ONLINE_STYLE_URL = 'mapbox://styles/mapbox/outdoors-v10'

const m = defineMessages({
  // The name of the default background map
  defaultBackgroundMapName: 'Default',
  // The name of the legacy offline background map
  offlineBackgroundMapName: 'Offline Map'
})

export const useMapStylesQuery = (enabled = true) => {
  const backgroundMapsEnabled = useExperimentsFlagsStore(
    store => store.backgroundMaps
  )

  const legacyStyleQueryResult = useLegacyMapStyleQuery(
    !backgroundMapsEnabled && enabled
  )
  const mapStylesQueryResult = useMapServerQuery(
    '/styles',
    backgroundMapsEnabled && enabled
  )
  const defaultMapStyle = useDefaultMapStyle()

  const queryResult = backgroundMapsEnabled
    ? {
        data: [
          defaultMapStyle,
          ...(mapStylesQueryResult?.data ? mapStylesQueryResult?.data : [])
        ],
        isLoading: mapStylesQueryResult.isLoading,
        refetch: mapStylesQueryResult.refetch
      }
    : {
        data: !legacyStyleQueryResult.data
          ? [defaultMapStyle]
          : legacyStyleQueryResult.data,
        isLoading: legacyStyleQueryResult.isLoading,
        refetch: legacyStyleQueryResult.refetch
      }

  return queryResult
}

const useLegacyMapStyleQuery = enabled => {
  const { formatMessage: t } = useIntl()
  const defaultMapStyle = useDefaultMapStyle()

  const queryResult = useQuery({
    queryKey: ['getLegacyMapStyle'],
    queryFn: async () => {
      try {
        // This checks whether an offline style is available
        await api.getMapStyle('default')

        return [
          {
            id: CUSTOM_MAP_ID,
            url: api.getMapStyleUrl('default'),
            bytesStored: 0,
            name: t(m.offlineBackgroundMapName),
            isImporting: false
          }
        ]
      } catch {
        return [defaultMapStyle]
      }
    },
    enabled
  })

  return queryResult
}

export const useDefaultMapStyle = () => {
  const { formatMessage: t } = useIntl()

  return {
    id: DEFAULT_MAP_ID,
    url: ONLINE_STYLE_URL,
    bytesStored: 0,
    name: t(m.defaultBackgroundMapName),
    isImporting: false,
    isDefault: true
  }
}
