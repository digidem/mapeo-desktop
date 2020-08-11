// @flow
import React from 'react'

import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import ReportView from './ReportView'
import type { PresetWithFields } from '../types'

const exampleObservations = require('../../../../../fixtures/observations.json')

const imageBaseUrl =
  'https://images.digital-democracy.org/mapfilter-sample/sample-'

const getMediaUrl = id => imageBaseUrl + ((parseInt(id, 16) % 17) + 1) + '.jpg'

export default {
  title: 'ReportView',
  component: ReportView,
  decorators: [
    (storyFn: any) => (
      <div style={{ width: '100vw', height: '100vh' }}>{storyFn()}</div>
    )
  ]
}

export const basic = () => (
  <ReportView
    getMediaUrl={getMediaUrl}
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations.slice(0, 10)}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
  />
)

const presets: PresetWithFields[] = [
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
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations.slice(0, 10)}
    onUpdateObservation={action('update')}
    onDeleteObservation={action('delete')}
    presets={presets}
  />
)
