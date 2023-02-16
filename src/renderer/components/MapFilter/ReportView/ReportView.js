//
import React from 'react'
import ViewWrapper from '../ViewWrapper'
import {} from '../MapView/MapViewContent'
import ReportViewContent from './ReportViewContent'

const ReportView = ({
  observations,
  onUpdateObservation,
  onDeleteObservation,
  presets,
  filter,
  getMediaUrl,
  ...otherProps
}) => {
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
        <ReportViewContent
          onClick={onClickObservation}
          observations={filteredObservations}
          getPreset={getPreset}
          getMedia={getMedia}
          totalObservations={observations ? observations.length : 0}
          {...otherProps}
        />
      )}
    </ViewWrapper>
  )
}

export default ReportView
