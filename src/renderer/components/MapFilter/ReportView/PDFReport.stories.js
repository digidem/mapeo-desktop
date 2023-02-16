//
import React from 'react'
import { useIntl } from 'react-intl'

import { PDFReport } from './PDFReport'
import { BlobProvider } from '@react-pdf/renderer'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import { defaultGetPreset } from '../utils/helpers'

const exampleObservations = require('../../../../../fixtures/observations.json')

const imageBaseUrl =
  'https://images.digital-democracy.org/mapfilter-sample/sample-'
const mapStyle = 'mapbox://styles/mapbox/outdoors-v11'
const mapboxAccessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const getMedia = ({ id }) => {
  return {
    src: getMediaUrl(id),
    type: 'image'
  }
}

const getMediaUrl = id => {
  if (id === 'portrait.jpg') return imageBaseUrl + id
  return imageBaseUrl + ((parseInt(id, 16) % 17) + 1) + '.jpg'
}

const exampleWithPresets = exampleObservations.slice(0, 1).map(o => ({
  observation: o,
  preset: defaultGetPreset(o),
  mediaSources: o.attachments.map(a => getMedia(a))
}))

export default {
  title: 'ReportView/components/PDFReport',
  component: PDFReport,
  decorators: [
    storyFn => (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#ddd',
          overflow: 'auto'
        }}
      >
        {storyFn()}
      </div>
    )
  ]
}

export const basic = () =>
  React.createElement(() => {
    const intl = useIntl()

    return (
      <BlobProvider
        document={
          <PDFReport
            intl={intl}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
            observationsWithPresets={exampleWithPresets}
          />
        }
      >
        {({ url, loading }) =>
          loading ? (
            <h2>Loading PDF...</h2>
          ) : (
            <Document file={url}>
              <Page pageNumber={1} renderTextLayer={false} />
              <Page pageNumber={2} renderTextLayer={false} />
            </Document>
          )
        }
      </BlobProvider>
    )
  })
