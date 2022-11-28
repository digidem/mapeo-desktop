// @ts-check
import ky from 'ky/umd'
import { useQuery } from '@tanstack/react-query'

// local host
// global port number
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

/**
 * @param {'/styles' | `/styles/${string}` | '/tilesets' | `/tilesets/${string}`} resourcePath URL path to resource on Map Server (needs to start with `/`)
 */
export function useMapServerQuery (resourcePath) {
  return useQuery({
    queryKey: [resourcePath],
    queryFn: () => ky.get(MAP_SERVER_URL + resourcePath).json()
  })
}

/**
 * @type {import('@tanstack/react-query').UseQueryResult<ReturnType<import('@mapeo/map-server/dist/api/styles').StylesApi["listStyles"]>>}
 */
const { data } = useMapServerQuery('/styles')
