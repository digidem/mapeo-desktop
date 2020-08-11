import React from 'react'
import { action } from '@storybook/addon-actions'
import { withKnobs, radios } from '@storybook/addon-knobs'

import MapView from './MapViewContent'
import fixtureObs from '../../fixtures/observations.json'

function getMedia({ id }, { width = 200, height = 200 } = {}) {
  const size = Math.floor(width / 100) * 100
  const idx = parseInt(id, 16)
  return {
    src: `https://picsum.photos/id/${+idx % 80}/${size}/${size}`,
    type: 'image'
  }
}

function getFilteredObservations(filter) {
  return filter === '**all**'
    ? fixtureObs
    : fixtureObs.filter(
        o => o.tags.happening && o.tags.happening.includes(filter)
      )
}

export default {
  title: 'MapView/Content',
  decorators: [withKnobs]
}

export const defaultStory = () => {
  const options = {
    All: '**all**',
    Mining: 'mining'
  }
  const value = radios('Filter', options, '**all**')
  const filteredObs = getFilteredObservations(value)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <MapView
        observations={filteredObs}
        onClick={action('click')}
        getMedia={getMedia}
        mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
      />
    </div>
  )
}

defaultStory.story = {
  name: 'default'
}

export const initialPosition = () => {
  const options = {
    All: '**all**',
    Mining: 'mining'
  }
  const value = radios('Filter', options, '**all**')
  const filteredObs = getFilteredObservations(value)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <MapView
        observations={filteredObs}
        onClick={action('click')}
        getMedia={getMedia}
        mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
        initialMapPosition={{
          center: [0.16, 51.45],
          zoom: 8
        }}
      />
    </div>
  )
}

initialPosition.story = {
  name: 'initial position'
}

export const imperativeMethods = () => {
  const options = {
    All: '**all**',
    Mining: 'mining'
  }
  const value = radios('Filter', options, '**all**')
  const filteredObs = getFilteredObservations(value)

  const MapViewWrapper = () => {
    const ref = React.useRef()

    const handleFlyClick = () => {
      if (!ref.current) return
      ref.current.flyTo({ center: [0.16, 51.45], zoom: 8 })
    }

    const handleFitBoundsClick = () => {
      if (!ref.current) return
      ref.current.fitBounds([[-59, 3.1], [-60, 2.1]])
    }

    return (
      <>
        <MapView
          ref={ref}
          observations={filteredObs}
          onClick={action('click')}
          getMediaUrl={getMedia}
          mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            flexDirection: 'column'
          }}>
          <button style={{ marginBottom: 5 }} onClick={handleFlyClick}>
            Fly to London
          </button>
          <button onClick={handleFitBoundsClick}>Zoom to data bounds</button>
        </div>
      </>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <MapViewWrapper />
    </div>
  )
}

imperativeMethods.story = {
  name: 'Imperative methods'
}
