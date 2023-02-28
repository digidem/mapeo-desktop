//
import React from 'react'

import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import ReportView from './ReportView'
import { SavingDialog, PageNavigator } from './ReportViewContent'

const exampleObservations = require('../../../../../fixtures/observations.json')

const imageBaseUrl =
  'https://images.digital-democracy.org/mapfilter-sample/sample-'
const mapStyle = 'mapbox://styles/mapbox/satellite-v10'
const mapboxAccessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const getMediaUrl = id => {
  if (id === 'portrait.jpg') return imageBaseUrl + id
  return imageBaseUrl + ((parseInt(id, 16) % 17) + 1) + '.jpg'
}

export default {
  title: 'ReportView',
  component: ReportView,
  decorators: [
    storyFn => <div style={{ width: '100%', height: '100%' }}>{storyFn()}</div>
  ]
}

export const All = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={exampleObservations}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const Single = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={exampleObservations.slice(0, 1)}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const NoLocation = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={[{ ...exampleObservations[0], lat: null, lon: null }]}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const InitialPage10 = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={exampleObservations}
    initialPageNumber={10}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const InvalidInitialPage = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={exampleObservations.slice(0, 7)}
    initialPageNumber={20}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const Empty = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken={mapboxAccessToken}
    observations={[]}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    mapStyle={mapStyle}
  />
)

export const savingDialog = () => <SavingDialog open />

export const pageNavigator = () => (
  <PageNavigator currentPage={7} setCurrentPage={action('changePage')} />
)

const presets = [
  {
    name: 'Mining',
    id: 'mining',
    geometry: ['point'],
    tags: {},
    fields: [
      {
        type: 'text',
        id: 'impacts',
        key: ['impacts'],
        label: 'What is the impact?'
      },
      {
        type: 'select_one',
        id: 'village',
        key: ['village'],
        label: 'Village?',
        options: [{ value: 'village_1', label: 'Potari Naawa' }]
      }
    ]
  },
  {
    name: 'Really long preset name to check text wrapping in title',
    id: 'fishing',
    geometry: ['point'],
    tags: {},
    fields: [
      {
        type: 'text',
        id: 'impacts',
        key: ['impacts'],
        label: 'What is the impact?'
      },
      {
        type: 'select_one',
        id: 'village',
        key: ['village'],
        label: 'Village?',
        options: [{ value: 'village_1', label: 'Potari Naawa' }]
      }
    ]
  },
  {
    name: 'Logging',
    id: 'logging',
    geometry: ['point'],
    tags: {},
    fields: [
      {
        type: 'text',
        id: 'impacts',
        key: ['impacts'],
        label: 'What is the impact?'
      }
    ]
  },
  {
    name: 'Oil Spill',
    id: 'oil',
    geometry: ['point'],
    tags: {},
    fields: [
      {
        type: 'text',
        id: 'impacts',
        key: ['impacts'],
        label: 'What is the impact?'
      }
    ]
  }
]

export const withPresets = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken='pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
    observations={exampleObservations.slice(0, 10)}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    presets={presets}
    mapStyle={mapStyle}
  />
)
