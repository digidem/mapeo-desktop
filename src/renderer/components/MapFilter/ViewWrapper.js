import * as React from 'react'
import isEqual from 'lodash/isEqual'
import createFilterOrig from 'mapeo-entity-filter'

import ObservationDialog from './ObservationDialog'
import getStats from './stats'
import { defaultGetPreset } from './utils/helpers'

const noop = () => {}

// This is a temporary wrapper to compile a filter that defines $preset into a
// filter that will work with our dataset, which currently uses categoryId to
// define which preset applies. We will need to improve how this works in the
// future once we start matching presets like we do with iD
const createFilter = filter => {
  if (!Array.isArray(filter) || filter[0] !== 'all' || filter.length < 2) {
    return () => true
  }
  const presetFilter = filter.map(subFilter => {
    if (
      !Array.isArray(subFilter) ||
      (subFilter[1] !== '$preset' && !isEqual(subFilter[1], ['$preset']))
    ) {
      return subFilter
    }
    return [subFilter[0], 'categoryId', ...subFilter.slice(2)]
  })
  return createFilterOrig(presetFilter)
}

// This is to avoid re-renders - this ensures the fallback value does not change
// between renders
const emptyObservations = []
const emptyPresets = []

const WrappedMapView = ({
  observations = emptyObservations,
  onUpdateObservation = noop,
  onDeleteObservation = noop,
  presets = emptyPresets,
  getMediaUrl,
  filter,
  children,
  ...otherProps
}) => {
  const stats = React.useMemo(() => getStats(observations), [observations])
  const [editingObservation, setEditingObservation] = React.useState(null)
  const [
    editingInitialImageIndex,
    setEditingInitialImageIndex
  ] = React.useState()

  const getPresetWithFallback = React.useCallback(
    observation => {
      const preset = getPreset(observation, presets)
      const defaultPreset = defaultGetPreset(observation, stats)
      if (!preset) return defaultPreset
      // $FlowFixMe - this checks out, seems to be a flow bug, it cannot understand that additionalFields is overwritten
      return {
        ...preset,
        additionalFields: defaultPreset.additionalFields.filter(
          // Any fields that are not defined in the preset we show as 'additionalFields'
          additionalField => {
            return !preset.fields.find(field => {
              const fieldKey = Array.isArray(field.key)
                ? field.key
                : [field.key]
              const additionalFieldKey = Array.isArray(additionalField.key)
                ? additionalField.key
                : [additionalField.key]
              return isEqual(fieldKey, additionalFieldKey)
            })
          }
        )
      }
    },
    [presets, stats]
  )

  const handleObservationClick = React.useCallback(
    (observationId, imageIndex) => {
      setEditingInitialImageIndex(imageIndex)
      setEditingObservation(observations.find(obs => obs.id === observationId))
    },
    [observations]
  )

  const getMedia = React.useCallback(
    (attachment, { width = 800 } = {}) => {
      const dpr = window.devicePixelRatio
      const size =
        width < 300 * dpr
          ? 'thumbnail'
          : width < 1200 * dpr
          ? 'preview'
          : 'original'
      return {
        src: getMediaUrl(attachment.id, size),
        type: 'image'
      }
    },
    [getMediaUrl]
  )

  const filterFunction = React.useMemo(() => createFilter(filter), [filter])
  const filteredObservations = React.useMemo(
    () => (filter ? observations.filter(filterFunction) : observations),
    [observations, filterFunction, filter]
  )

  return (
    <>
      {children({
        onClickObservation: handleObservationClick,
        filter,
        filteredObservations,
        getPreset: getPresetWithFallback,
        getMedia
      })}
      <ObservationDialog
        open={!!editingObservation}
        observation={editingObservation}
        initialImageIndex={editingInitialImageIndex}
        getPreset={getPresetWithFallback}
        getMedia={getMedia}
        onRequestClose={() => setEditingObservation(false)}
        onSave={onUpdateObservation}
        onDelete={onDeleteObservation}
      />
    </>
  )
}

export default WrappedMapView

// TODO: Update this function to match presets like ID Editor
function getPreset (observation, presets) {
  const tags = observation.tags
  if (!tags || !tags.categoryId) return
  const preset = presets.find(preset => preset.id === tags.categoryId)
  return preset
}
