// @ts-check
import ky from 'ky/umd'
import { useQuery } from '@tanstack/react-query'

// local host
// global port number
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

const apiLayer = () => {
  function getStylesFn () {
    /**
     * @type {Promise<ReturnType<import('@mapeo/map-server/dist/api/styles').StylesApi["listStyles"]>>}
     */
    const listSyles = ky.get(MAP_SERVER_URL + '/styles').json()
    return listSyles
  }

  return {
    getStyle: getStylesFn
  }
}

const { data } = useQuery({
  queryKey: ['listStyle'],
  queryFn: apiLayer().getStyle
})
