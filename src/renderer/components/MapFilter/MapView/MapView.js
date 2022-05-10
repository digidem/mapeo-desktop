// @flow
import React from 'react'

import MapViewContent, {
  type MapViewContentProps,
  type MapInstance
} from './MapViewContent'
import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'

type Props = {
  ...$Exact<CommonViewProps>,
  ...$Exact<MapViewContentProps>
}

const MapView = (
  {
    observations,
    onUpdateObservation,
    onDeleteObservation,
    presets,
    filter,
    getMediaUrl,
    ...otherProps
  }: Props,
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

export default React.forwardRef<Props, MapInstance>(MapView)
