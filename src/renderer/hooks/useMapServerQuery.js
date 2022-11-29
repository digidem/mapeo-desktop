// @ts-check
import ky from 'ky/umd'
import { useQuery } from '@tanstack/react-query'

// local host
// global port number
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

/** @typedef {import('@mapeo/map-server/dist/lib/stylejson').StyleJSON } StyleJSON */
/** @typedef {import('@mapeo/map-server/dist/lib/tilejson').TileJSON } TileJSON */
/** @typedef {ReturnType<import('@mapeo/map-server/dist/api/styles').StylesApi["listStyles"]>} MapServerStyleInfo */
/**
 * @template TData
 * @typedef {import('@tanstack/react-query').UseQueryResult<TData>} UseQueryResult<TData>
 */

/**
 * @type {{
 * (resourcePath: '/styles') => UseQueryResult<MapServerStyleInfo>
 * (resourcePath: `/styles/${string}`) => UseQueryResult<StyleJSON>
 * }}
 */
export function useMapServerQuery (resourcePath) {
  return useQuery({
    queryKey: [resourcePath],
    queryFn: () => ky.get(MAP_SERVER_URL + resourcePath).json()
  })
}
;(async () => {
  const { data } = await useMapServerQuery('/styles')
})()
