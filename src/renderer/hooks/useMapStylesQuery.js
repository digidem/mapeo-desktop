// @ts-check
import { useExperimentsFlagsStore } from './store'
import { useMapServerQuery } from './useMapServerQuery'
import { useQuery } from '@tanstack/react-query'
import api from '../new-api'

export const useMapStylesQuery = () => {
  const backgroundMapsEnabled = useExperimentsFlagsStore(
    store => store.backgroundMaps
  )
  const legacyStyleQueryResult = useLegacyMapStyleQuery(!backgroundMapsEnabled)
  const mapStylesQueryResult = useMapServerQuery(
    '/styles',
    backgroundMapsEnabled
  )

  return backgroundMapsEnabled ? mapStylesQueryResult : legacyStyleQueryResult
}

export const useLegacyMapStyleQuery = enabled => {
  const ONLINE_STYLE_URL = 'mapbox://styles/mapbox/outdoors-v10'
  const offlineStyleURL = api.getMapStyleUrl('default')

  const queryResult = useQuery({
    queryKey: ['getLegacyMapStyle'],
    queryFn: async () => {
      try {
        // This checks whether an offline style is available
        await api.getMapStyle('default')
        // and if it is, it will use that map style (retrieved above).
        return [offlineStyleURL]
      } catch {
        // If no offline style is available we use the default online style
        return [ONLINE_STYLE_URL]
      }
    },
    enabled
  })

  return queryResult
}
