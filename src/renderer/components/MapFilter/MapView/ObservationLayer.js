// @flow
import React, { useMemo, useCallback, useContext, useRef } from 'react'
import { Layer, Source, MapContext } from 'react-mapbox-gl'
import type { Observation } from 'mapeo-schema'
import type {
  Point2D,
  FeatureTemplate,
  FeatureCollectionTemplate
} from 'flow-geojson'

type Props = {
  observations: Array<Observation>,
  onMouseMove: any => any,
  onMouseLeave: any => any,
  onClick?: (id: string) => any,
  print?: boolean
}

type FeaturePoint2D = FeatureTemplate<Point2D>
type FeatureCollectionPoint2D = FeatureCollectionTemplate<FeaturePoint2D[]>
type GeoJsonSource = {
  type: 'geojson',
  data: FeatureCollectionPoint2D
}

const observationSourceId = 'mapeo-observations-internal'

// const labelStyleLayer = {
//   id: 'labels',
//   type: 'symbol',
//   source: 'features',
//   layout: {
//     'text-field': '',
//     'text-allow-overlap': true,
//     'text-ignore-placement': true,
//     'text-size': 9,
//     'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold']
//   },
//   paint: {
//     'text-color': '#fff',
//     'text-halo-color': 'rgba(100,100,100, 0.3)',
//     'text-halo-width': 0.3
//   }
// }

const pointStyleLayer = {
  id: 'points',
  type: 'circle',
  sourceId: observationSourceId,
  paint: {
    // make circles larger as the user zooms from z12 to z22
    'circle-radius': {
      base: 1.5,
      stops: [[7, 5], [18, 25]]
    },
    'circle-color': '#ff0000',
    'circle-opacity': 0.75,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.9
  }
}

const pointHoverStyleLayer = {
  id: 'points-hover',
  type: 'circle',
  sourceId: observationSourceId,
  paint: {
    ...pointStyleLayer.paint,
    'circle-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0
    ],
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0
    ]
  }
}

function observationsToGeoJsonSource(
  observations: Observation[]
): GeoJsonSource {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: observations.reduce((acc, obs, i) => {
        // Skip if null or undefined
        if (obs.lat == null || obs.lon == null) return acc
        const point: FeaturePoint2D = {
          id: i,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [obs.lon, obs.lat]
          },
          properties: {
            id: obs.id
          }
        }
        acc.push(point)
        return acc
      }, [])
    }
  }
}

const noop = () => {}

const ObservationLayer = ({
  observations,
  onClick = noop,
  onMouseLeave,
  onMouseMove,
  print = false
}: Props) => {
  const hovered = useRef(null)
  const map = useContext(MapContext)

  const geoJsonSource = useMemo(
    () => observationsToGeoJsonSource(observations),
    [observations]
  )

  const handleMouseMove = useCallback(
    e => {
      if (print) return
      map.getCanvas().style.cursor = e.features.length ? 'pointer' : ''
      if (e.features.length === 0) return
      if (hovered.current) {
        map.setFeatureState(
          { source: observationSourceId, id: hovered.current },
          { hover: false }
        )
      }
      hovered.current = e.features[0].id
      map.setFeatureState(
        { source: observationSourceId, id: hovered.current },
        { hover: true }
      )
      onMouseMove(e)
    },
    [map, onMouseMove, print]
  )

  const handleMouseLeave = useCallback(
    e => {
      if (print) return
      if (hovered.current) {
        map.setFeatureState(
          { source: observationSourceId, id: hovered.current },
          { hover: false }
        )
      }
      hovered.current = null
      map.getCanvas().style.cursor = ''
      onMouseLeave(e)
    },
    [map, onMouseLeave, print]
  )

  const handleClick = useCallback(
    e => {
      if (print) return
      if (e.features.length === 0) return
      onClick(e.features[0].properties.id)
    },
    [onClick, print]
  )

  return (
    <>
      <Source id={observationSourceId} geoJsonSource={geoJsonSource} />
      <Layer
        {...pointStyleLayer}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <Layer {...pointHoverStyleLayer} />
    </>
  )
}

export default ObservationLayer
