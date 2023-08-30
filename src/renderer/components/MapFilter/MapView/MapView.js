// @ts-check

import React, { useState } from 'react'

import MapViewContent from './MapViewContent'
import ViewWrapper from '../ViewWrapper'
import { Avatar, makeStyles } from '@material-ui/core'
import { LayersOutlined } from '@material-ui/icons'
import { BackgroundMapSelector } from './BackgroundMapSelector'
import {
  useBackgroundMapStore,
  useExperimentsFlagsStore
} from '../../../hooks/store'
import { useMapStylesQuery } from '../../../hooks/useMapStylesQuery'

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
  const [backgroundMapSelectorOpen, setBackgroundMapSelectorOpen] = useState(
    false
  )
  const backgroundMapsFlag = useExperimentsFlagsStore(
    store => store.backgroundMaps
  )
  const { mapStyle, setMapStyle } = useBackgroundMapStore()

  return (
    <>
      {backgroundMapsFlag ? (
        <MapLayerButton
          onClick={() =>
            setBackgroundMapSelectorOpen(selectorWasOpen => !selectorWasOpen)
          }
        />
      ) : null}
      <ViewWrapper
        observations={observations}
        onUpdateObservation={onUpdateObservation}
        onDeleteObservation={onDeleteObservation}
        presets={presets}
        filter={filter}
        getMediaUrl={getMediaUrl}
      >
        {({
          onClickObservation,
          filteredObservations,
          getPreset,
          getMedia
        }) => (
          <MapViewContent
            ref={ref}
            onClick={onClickObservation}
            observations={filteredObservations}
            getPreset={getPreset}
            getMedia={getMedia}
            presets={presets}
            {...otherProps}
            mapStyle={mapStyle.url}
          />
        )}
      </ViewWrapper>
      <BackgroundMapSelector
        active={backgroundMapsFlag && backgroundMapSelectorOpen}
        dismiss={() => setBackgroundMapSelectorOpen(false)}
      />
    </>
  )
}

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer'
  },
  icon: {
    color: theme.palette.common.black
  }
}))

const MapLayerButton = ({ onClick }) => {
  const classes = useStyles()
  return (
    <Avatar
      className={classes.avatar}
      style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
      onClick={onClick}
    >
      <LayersOutlined className={classes.icon} />
    </Avatar>
  )
}

export default React.forwardRef(MapView)
