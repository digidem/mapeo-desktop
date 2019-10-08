import { useState, useEffect } from 'react'
import api from '../../new-api'

const MapStyleProvider = ({ children }) => {
  const [style, setStyle] = useState('mapbox://styles/mapbox/outdoors-v10')

  useEffect(() => {
    const offlineStyleURL = api.getMapStyleUrl('default')
    // This is just to check whether an offline style is available, and if it
    // is, use that as the map style. Otherwise, use the online mapbox style
    api
      .getMapStyle('default')
      .then(() => setStyle(offlineStyleURL))
      .catch(() => {})
  }, [])

  return children(style)
}

export default MapStyleProvider
