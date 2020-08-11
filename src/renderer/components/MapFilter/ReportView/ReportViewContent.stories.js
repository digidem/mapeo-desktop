// @flow
import React from 'react'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import ReportView from './ReportViewContent'
import { defaultGetPreset } from '../utils/helpers'

const exampleObservations = require('../../../../../fixtures/observations.json')

const imageBaseUrl =
  'https://images.digital-democracy.org/mapfilter-sample/sample-'

const getMedia = ({ id }) => ({
  src: imageBaseUrl + ((parseInt(id, 16) % 17) + 1) + '.jpg',
  type: 'image'
})

export default {
  title: 'ReportView/Content',
  decorators: [
    withKnobs,
    (storyFn: any) => (
      <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
        {storyFn()}
      </div>
    )
  ]
}

export const withoutImages = () => (
  <ReportView
    getPreset={defaultGetPreset}
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations}
    onClick={action('click')}
    getMedia={() => {}}
  />
)

export const images = () => (
  <ReportView
    getPreset={defaultGetPreset}
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations}
    onClick={action('click')}
    getMedia={getMedia}
  />
)

export const customFields = () => (
  <ReportView
    getPreset={defaultGetPreset}
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations}
    onClick={action('click')}
    getMedia={getMedia}
    getFields={obs => [
      {
        id: 'myField',
        key: 'caption',
        label: 'Image caption',
        type: 'text',
        appearance: 'multiline'
      }
    ]}
  />
)

export const printView = () => (
  <ReportView
    getPreset={defaultGetPreset}
    mapboxAccessToken="pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg"
    observations={exampleObservations.slice(0, 50)}
    onClick={action('click')}
    getMedia={getMedia}
    print={boolean('Print', false)}
  />
)
