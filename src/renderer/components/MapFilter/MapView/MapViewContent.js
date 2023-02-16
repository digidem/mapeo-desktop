//
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle
} from 'react'
import { useIntl } from 'react-intl'
import ReactMapboxGl from 'react-mapbox-gl'
import mapboxgl from 'mapbox-gl'

import { getLastImage } from '../utils/helpers'
import { makeStyles } from '@material-ui/core/styles'
import ObservationLayer from './ObservationLayer'
import Popup from './Popup'

const useStyles = makeStyles({
  container: {
    flex: 1
  },
  '@global': {
    // The "Improve Map" link does not work when Mapeo Desktop is used offline,
    // and since the data the user is looking at is mainly data that is not in
    // OpenStreetMap, this link does not make much sense to the user.
    '.mapbox-improve-map': {
      display: 'none'
    }
  }
})

const fitBoundsOptions = {
  duration: 0,
  padding: 10
}

const noop = () => {}

const MapViewContent = (
  {
    observations,
    mapboxAccessToken,
    getPreset,
    getMedia,
    onClick,
    initialMapPosition = {},
    onMapMove = noop,
    mapStyle = 'mapbox://styles/mapbox/outdoors-v10',
    print = false,
    presets
  },
  ref
) => {
  const map = useRef()
  const classes = useStyles()
  const intl = useIntl()
  const [hovered, setHovered] = useState(null)
  const [styleLoaded, setStyleLoaded] = useState(false)

  useImperativeHandle(ref, () => ({
    fitBounds: (...args) => {
      if (!map.current) return
      map.current.fitBounds.apply(map.current, args)
    },
    flyTo: (...args) => {
      if (!map.current) return
      map.current.flyTo.apply(map.current, args)
    }
  }))

  // We don't want to change the map viewport if the observations array changes,
  // which it will do if the filter changes. We only set the bounds for the very
  // initial render, and only if initialMapPosition zoom and center are not set.
  const initialBounds = useMemo(
    () =>
      initialMapPosition.center == null && initialMapPosition.zoom == null
        ? getBounds(observations)
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (
      !map.current ||
      !observations ||
      !observations.length ||
      map.current.__hasMoved ||
      (initialMapPosition.center != null && initialMapPosition.zoom != null)
    )
      return
    map.current.__hasMoved = true
    const bounds = getBounds(observations)
    map.current.flyTo({
      center: [
        bounds[0][0] + (bounds[1][0] - bounds[0][0]) / 2,
        bounds[0][1] + (bounds[1][1] - bounds[0][1]) / 2
      ],
      zoom: 9,
      bearing: 0,
      pitch: 0
    })
  }, [
    initialMapPosition.center,
    initialMapPosition.zoom,
    observations,
    styleLoaded
  ])

  // We don't allow the map to be a controlled component - position can only be
  // set when the map is initially mounted and after that state is internal
  const position = useMemo(() => {
    const { center, zoom, bearing, pitch } = initialMapPosition
    const bounds = getBounds(observations)
    // initialMapPosition overrides default behaviour of fitting the map to the
    // bounds of the observations, but if any properties of initialMapPosition are
    // we set some default values
    return {
      center: center || [
        bounds[0][0] + (bounds[1][0] - bounds[0][0]) / 2,
        bounds[0][1] + (bounds[1][1] - bounds[0][1]) / 2
      ],
      zoom: zoom ? [zoom] : [9],
      bearing: bearing ? [bearing] : [0],
      pitch: pitch ? [pitch] : [0]
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Mapbox = useMemo(
    () =>
      ReactMapboxGl({
        accessToken: mapboxAccessToken,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
        scrollZoom: !print,
        injectCSS: false
      }),
    [mapboxAccessToken, print]
  )

  const handleStyleLoad = useCallback(mapInstance => {
    mapInstance.addControl(new mapboxgl.NavigationControl({}))
    mapInstance.addControl(new mapboxgl.ScaleControl({}))
    mapInstance.addControl(
      new mapboxgl.AttributionControl({
        compact: true
      })
    )
    map.current = mapInstance
    setStyleLoaded(true)
  }, [])

  const handleMouseMove = useCallback(
    e => {
      if (e.features.length === 0) return setHovered(null)
      const obs = observations.find(
        obs => obs.id === e.features[0].properties.id
      )
      setHovered(obs)
    },
    [observations]
  )

  const handleMouseLeave = useCallback(e => {
    setHovered(null)
  }, [])

  const handleMapMove = useCallback(
    (map, e) => {
      onMapMove({
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch()
      })
    },
    [onMapMove]
  )

  function getLastImageUrl (observation) {
    const lastImageAttachment = getLastImage(observation)
    if (!lastImageAttachment) return
    const media = getMedia(lastImageAttachment, {
      width: Popup.imageSize,
      height: Popup.imageSize
    })
    if (media) return media.src
  }

  function getName (observation) {
    const preset = getPreset(observation)
    return (preset && preset.name) || 'Observation'
  }

  return (
    <Mapbox
      style={mapStyle}
      className={classes.container}
      fitBounds={initialBounds}
      fitBoundsOptions={fitBoundsOptions}
      onStyleLoad={handleStyleLoad}
      onMove={handleMapMove}
      {...position}
    >
      <ObservationLayer
        observations={observations}
        onClick={onClick}
        presets={presets}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        print={print}
      />
      {hovered && (
        <Popup
          imageUrl={getLastImageUrl(hovered)}
          title={getName(hovered)}
          subtitle={intl.formatTime(hovered.created_at, {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
          })}
          coordinates={
            // $FlowFixMe - these are always non-nullish when on a map
            [hovered.lon, hovered.lat]
          }
        />
      )}
    </Mapbox>
  )
}

export default React.forwardRef(MapViewContent)

function getBounds (observations) {
  const extent = [
    [-180, -85],
    [180, 85]
  ]
  for (const { lat, lon } of observations) {
    if (lon == null || lat == null) continue
    if (extent[0][0] < lon) extent[0][0] = lon
    if (extent[0][1] < lat) extent[0][1] = lat
    if (extent[1][0] > lon) extent[1][0] = lon
    if (extent[1][1] > lat) extent[1][1] = lat
  }
  return extent
}
