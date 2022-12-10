// @ts-check
import ky from 'ky/umd'
import { useQuery } from '@tanstack/react-query'

// local host and global port number
// @ts-ignore
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

export function useMapServerQuery (resourcePath, enabled) {
  return useQuery({
    queryKey: [resourcePath],
    queryFn: () => ky.get(MAP_SERVER_URL + resourcePath).json()
  })
}
