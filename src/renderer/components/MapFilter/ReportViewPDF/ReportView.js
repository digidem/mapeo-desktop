// @flow

import React from 'react'
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer'
import type { Observation } from 'mapeo-schema'
import { FormattedTime, IntlProvider } from 'react-intl'

// import ReportFeature from './ReportFeature'
// import ReportPageContent from './ReportPageContent'
import { defaultGetPreset, isEmptyValue } from '../utils/helpers'
import { get } from '../utils/get_set'

import type {
  PaperSize,
  CameraOptions,
  CommonViewContentProps,
  PresetWithAdditionalFields,
  Primitive
} from '../types'
import FormattedFieldname from '../internal/FormattedFieldname'
import FormattedValue from '../internal/FormattedValue'
import FormattedLocation from '../internal/FormattedLocation'

export type ReportViewPDFProps = {
  /** Called with
   * [CameraOptions](https://docs.mapbox.com/mapbox-gl-js/api/#cameraoptions)
   * with properties `center`, `zoom`, `bearing`, `pitch` */
  onMapMove?: CameraOptions => any,
  /** Initial position of the map - an object with properties `center`, `zoom`,
   * `bearing`, `pitch`. If this is not set then the map will by default zoom to
   * the bounds of the observations. If you are going to unmount and re-mount
   * this component (e.g. within tabs) then you will want to use onMove to store
   * the position in state, and pass it as initialPosition for when the map
   * re-mounts. */
  initialMapPosition?: $Shape<CameraOptions>,
  /** Mapbox access token */
  mapboxAccessToken: string,
  /** Mapbox style url */
  mapStyle?: any
}

type Props = {
  ...$Exact<ReportViewPDFProps>,
  ...$Exact<CommonViewContentProps>,
  /** Paper size for report */
  paperSize?: PaperSize,
  /** Render for printing (for screen display only visible observations are
   * rendered, for performance reasons) */
  print?: boolean
}

Font.register({
  family: 'SourceSansPro',
  fonts: [
    { src: 'fonts/SourceSansPro-Regular.ttf' }, // font-style: normal, font-weight: normal
    { src: 'fonts/SourceSansPro-Italic.ttf', fontStyle: 'italic' },
    { src: 'fonts/SourceSansPro-Bold.ttf', fontWeight: 700 },
    {
      src: 'fonts/SourceSansPro-BoldItalic.ttf',
      fontStyle: 'italic',
      fontWeight: 700
    },
    { src: 'fonts/SourceSansPro-Light.ttf', fontWeight: 300 },
    {
      src: 'fonts/SourceSansPro-LightItalic.ttf',
      fontStyle: 'italic',
      fontWeight: 300
    }
  ]
})

const FeaturePage = ({
  observation,
  preset = {},
  getMedia
}: {
  observation: Observation,
  preset?: PresetWithAdditionalFields,
  getMedia: any
}) => {
  const coords =
    typeof observation.lon === 'number' && typeof observation.lat === 'number'
      ? {
          longitude: observation.lon,
          latitude: observation.lat
        }
      : undefined
  const createdAt =
    typeof observation.created_at === 'string'
      ? new Date(observation.created_at)
      : undefined
  const fields = preset.fields.concat(preset.additionalFields)
  const tags = observation.tags || {}
  const note = tags.note || tags.notes
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed></View>
      <View style={styles.pageContent}>
        <View style={styles.columnLeft}>
          <Text style={styles.presetName}>{preset.name || 'Observation'}</Text>
          {createdAt && (
            <Text style={styles.createdAt}>
              <Text style={styles.createdAtLabel}>Registrado: </Text>
              <FormattedTime
                key="time"
                value={createdAt}
                year="numeric"
                month="long"
                day="2-digit"
              />
            </Text>
          )}
          {coords && (
            <Text style={styles.location}>
              <Text style={styles.locationLabel}>Ubicación: </Text>
              <FormattedLocation {...coords} />
            </Text>
          )}
          {note &&
            note.split('\n').map((para, idx) => (
              <Text key={idx} style={styles.description}>
                {para}
              </Text>
            ))}
          <Text style={styles.details}>Detalles</Text>
          {fields.map(field => {
            const value: Primitive | Array<Primitive> = get(tags, field.key)
            if (isEmptyValue(value)) return null
            return (
              <View key={field.id} style={styles.field} wrap={false}>
                <Text style={styles.fieldLabel}>
                  <FormattedFieldname field={field} />
                </Text>
                <Text style={styles.fieldValue}>
                  <FormattedValue field={field} value={value} />
                </Text>
              </View>
            )
          })}
        </View>
        <View style={styles.columnRight}>
          {observation.attachments && observation.attachments.slice(0, 4).map((att, i) => {
            const media = getMedia(att)
            return media && <Image
              src={media.src}
              key={i}
              style={styles.image}
              wrap={false}
            />
          }
          )}
        </View>
      </View>
      <View style={styles.footer} fixed></View>
    </Page>
  )
}

export const PdfContext = React.createContext<boolean>(false)

const ReportViewPDF = ({
  observations,
  getPreset = defaultGetPreset,
  getMedia,
  paperSize = 'a4',
  mapboxAccessToken,
  mapStyle
}: Props) => {
  return (
    <PdfContext.Provider value={true}>
      <IntlProvider>
        <Document>
          {observations.map(observation => (
            <FeaturePage
              key={observation.id}
              observation={observation}
              preset={getPreset(observation)}
              getMedia={getMedia}
            />
          ))}
        </Document>
      </IntlProvider>
    </PdfContext.Provider>
  )
}

export default ReportViewPDF

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 120,
    paddingBottom: 35,
    paddingHorizontal: 35,
    flexDirection: 'row'
  },
  pageContent: {
    flex: 1,
    flexDirection: 'row',
    fontFamily: 'SourceSansPro'
  },
  columnLeft: {
    flex: 2,
    paddingRight: 12,
    lineHeight: 1.2
  },
  columnRight: {
    // backgroundColor: 'aqua',
    flex: 1
  },
  presetName: {
    fontWeight: 700
  },
  createdAt: {
    fontSize: 12
  },
  createdAtLabel: {
    fontSize: 12,
    color: 'grey'
  },
  location: {
    fontSize: 12,
    marginBottom: 6
  },
  locationLabel: {
    fontSize: 12,
    color: 'grey'
  },
  map: {
    height: '60mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 12,
    backgroundColor: '#8E918B'
  },
  image: {
    height: '40mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    backgroundColor: '#C8D8E3'
  },
  description: {
    marginBottom: 6,
    fontSize: 12
  },
  details: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    marginTop: 12
  },
  field: {
    marginBottom: 6
  },
  fieldLabel: {
    fontSize: 9,
    marginBottom: 1,
    color: '#333333'
  },
  fieldValue: {
    fontSize: 12
  },
  header: {
  },
  footer: {
  }

})
