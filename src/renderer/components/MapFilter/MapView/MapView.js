import React from 'react'

import MapViewContent from './MapViewContent'
import ViewWrapper from '../ViewWrapper'

const MapView = (
  {
    observations,
    onUpdateObservation,
    onDeleteObservation,
    presets,
    filter,
    getMediaUrl,
    ...otherProps
  },
  ref
) => {
  return (
    <ViewWrapper
      observations={observations}
      onUpdateObservation={onUpdateObservation}
      onDeleteObservation={onDeleteObservation}
      presets={presets}
      filter={filter}
      getMediaUrl={getMediaUrl}
    >
      {({ onClickObservation, filteredObservations, getPreset, getMedia }) => (
        <MapViewContent
          ref={ref}
          onClick={onClickObservation}
          observations={filteredObservations}
          getPreset={getPreset}
          getMedia={getMedia}
          presets={presets}
          {...otherProps}
        />
      )}
    </ViewWrapper>
  )
}

export default React.forwardRef(MapView)
