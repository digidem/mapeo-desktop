// @flow
import React from 'react'
import { RawIntlProvider, IntlProvider, FormattedTime } from 'react-intl'
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet
} from '@react-pdf/renderer'
import FormattedLocation from '../internal/FormattedLocation'
import { isEmptyValue } from '../utils/helpers'
import { get } from '../utils/get_set'
import FormattedFieldname from '../internal/FormattedFieldname'
import FormattedValue from '../internal/FormattedValue'
import type { PaperSize, CommonViewContentProps } from '../types'
import {
  SettingsContext,
  defaultSettings,
  type SettingsContextType
} from '../internal/Context'
import type { Observation } from 'mapeo-schema'

type Props = {
  ...$Exact<$Diff<CommonViewContentProps, { onClick: * }>>,
  /** Rendering a PDF does not inherit context from the parent tree. Get this
   * value with useIntl() and provide it as a prop */
  intl?: any,
  /** Rendering a PDF does not inherit context from the parent tree. Get this
   * value with React.useContext(SettingsContext) and provide it as a prop */
  settings?: SettingsContextType,
  /** Paper size for report */
  paperSize?: PaperSize
}

type PageProps = {
  getPreset: $ElementType<Props, 'getPreset'>,
  getMedia: $ElementType<Props, 'getMedia'>,
  observation: Observation
}

const PDFReport = ({
  observations,
  intl,
  settings = defaultSettings,
  ...otherProps
}: Props) => {
  const children = (
    <SettingsContext.Provider value={settings}>
      <Document>
        {observations.map(obs => (
          <Page key={obs.id} size="A4" style={styles.page} wrap>
            <FeaturePage key={obs.id} observation={obs} {...otherProps} />
          </Page>
        ))}
      </Document>
    </SettingsContext.Provider>
  )
  // Need to provide `intl` for dates to format according to language, but will
  // fallback to `en` with default intl object
  return intl ? (
    <RawIntlProvider value={intl}>{children}</RawIntlProvider>
  ) : (
    <IntlProvider>{children}</IntlProvider>
  )
}

const FeaturePage = ({ observation, getPreset, getMedia }: PageProps) => {
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

  const preset = getPreset(observation)
  const fields = preset.fields.concat(preset.additionalFields)
  const tags = observation.tags || {}
  const note = tags.note || tags.notes
  const mediaItems: string[] = (observation.attachments || []).reduce(
    (acc, cur) => {
      const item = getMedia(cur, { width: 800, height: 600 })
      if (item && item.type === 'image') acc.push(item.src)
      return acc
    },
    []
  )

  return (
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
        <View>
          {note &&
            note.split('\n').map((para, idx) => (
              <Text key={idx} style={styles.description}>
                {para}
              </Text>
            ))}
        </View>
        <Text style={styles.details}>Detalles</Text>
        {fields.map(field => {
          const value = get(tags, field.key)
          if (isEmptyValue(value)) return null
          return (
            <View key={field.id} style={styles.field} wrap={false}>
              <Text style={styles.fieldLabel}>
                <FormattedFieldname field={field} component={Text} />
              </Text>
              <Text style={styles.fieldValue}>
                <FormattedValue field={field} value={value} />
              </Text>
            </View>
          )
        })}
      </View>
      <View style={styles.columnRight}>
        {mediaItems.map((src, i) => (
          <Image src={src} key={i} style={styles.image} wrap={false} />
        ))}
      </View>
    </View>
  )
}

export default PDFReport

// Convert pixel to millimetres
function mm(v) {
  return v / (25.4 / 72)
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingVertical: mm(20),
    paddingHorizontal: mm(15),
    flexDirection: 'row'
  },
  pageContent: {
    flex: 1,
    flexDirection: 'row'
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
  header: {},
  footer: {}
})
