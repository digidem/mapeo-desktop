// @flow
import React, { useMemo, useCallback, useContext, useRef } from 'react'
import { Layer, Source, MapContext } from 'react-mapbox-gl'
import validateColor from 'validate-color'
import type { Observation } from 'mapeo-schema'
import type {
  Point2D,
  FeatureTemplate,
  FeatureCollectionTemplate
} from 'flow-geojson'
import type { PresetWithFields } from '../types'

type Props = {
  observations: Array<Observation>,
  onMouseMove: any => any,
  onMouseLeave: any => any,
  onClick?: (id: string) => any,
  print?: boolean,
  presets: PresetWithFields[]
}

type FeaturePoint2D = FeatureTemplate<Point2D>
type FeatureCollectionPoint2D = FeatureCollectionTemplate<FeaturePoint2D[]>
type GeoJsonSource = {
  type: 'geojson',
  data: FeatureCollectionPoint2D
}

const observationSourceId = 'mapeo-observations-internal'
const DEFAULT_MARKER_COLOR = '#ff0000'

function observationsToGeoJsonSource (
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
            id: obs.id,
            categoryId:
              obs.tags && obs.tags.categoryId ? obs.tags.categoryId : undefined
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
  presets,
  print = false
}: Props) => {
  const hovered = useRef(null)
  const map = useContext(MapContext)

  const geoJsonSource = useMemo(
    () => observationsToGeoJsonSource(observations),
    [observations]
  )

  const [observationStyleLayer, pointHoverStyleLayer] = useMemo(() => {
    // Based on example implementation:
    // https://github.com/react-native-mapbox-gl/maps/blob/d6e7257e705b8e0be5d2d365a495c514b7f015f5/example/src/examples/SymbolCircleLayer/DataDrivenCircleColors.js
    const categoryColorPairs = presets.reduce((pairs, preset) => {
      const { color, id } = preset

      if (color && validateColor(color)) {
        pairs.push(id, preset.color)
      }

      return pairs
    }, [])

    const obsStyle = {
      id: 'points',
      type: 'circle',
      sourceId: observationSourceId,
      paint: {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
          base: 1.5,
          stops: [
            [7, 5],
            [18, 25]
          ]
        },
        'circle-color':
          categoryColorPairs.length > 0
            ? [
                'match',
                ['get', 'categoryId'],
                ...categoryColorPairs,
                DEFAULT_MARKER_COLOR
              ]
            : DEFAULT_MARKER_COLOR,
        'circle-opacity': 0.75,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.9
      }
    }

    const hoverStyle = {
      id: 'points-hover',
      type: 'circle',
      sourceId: observationSourceId,
      paint: {
        ...obsStyle.paint,
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

    return [obsStyle, hoverStyle]
  }, [presets])

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
        {...observationStyleLayer}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <Layer {...pointHoverStyleLayer} />
    </>
  )
}

export default ObservationLayer
