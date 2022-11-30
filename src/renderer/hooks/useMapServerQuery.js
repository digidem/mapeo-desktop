import ky from 'ky/umd'
import { useQuery } from '@tanstack/react-query'

// local host
// global port number
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

export function useMapServerQuery (resourcePath) {
  return useQuery({
    queryKey: [resourcePath],
    queryFn: () => ky.get(MAP_SERVER_URL + resourcePath).json()
  })
}
