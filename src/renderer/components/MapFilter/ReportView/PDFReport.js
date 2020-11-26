// @flow
import React from 'react'
import {
  RawIntlProvider,
  IntlProvider,
  defineMessages,
  useIntl,
  FormattedTime,
  FormattedMessage
} from 'react-intl'
import {
  pdf,
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet
} from '@react-pdf/renderer'
import type { Field } from 'mapeo-schema'
import PQueue from 'p-queue'

import {
  FormattedFieldProp,
  FormattedFieldValue
} from '../internal/FormattedData'
import FormattedLocation from '../internal/FormattedLocation'
import { isEmptyValue } from '../utils/helpers'
import { get } from '../utils/get_set'
import type { ImageMediaItem } from '../ObservationDialog'
import type {
  PresetWithAdditionalFields,
  CommonViewContentProps
} from '../types'
import {
  SettingsContext,
  defaultSettings,
  type SettingsContextType
} from '../internal/Context'
import { type MapViewContentProps } from '../MapView/MapViewContent'
import api from '../../../new-api'

const m = defineMessages({
  // Button label for hide fields menu
  detailsHeader: 'Details',
  locationHeader: 'Location',
  dateHeader: 'Created at'
})

export type ReportProps = {
  ...$Exact<$Diff<CommonViewContentProps, { onClick: * }>>,
  /** Rendering a PDF does not inherit context from the parent tree. Get this
   * value with useIntl() and provide it as a prop */
  intl?: any,
  /** Rendering a PDF does not inherit context from the parent tree. Get this
   * value with React.useContext(SettingsContext) and provide it as a prop */
  settings?: SettingsContextType,
  /** Called with an index of ids, position in array is page number */
  onPageIndex?: (index: Array<string>) => any,
  ...$Exact<MapViewContentProps>
}

/*  TODO: add frontpage
const FrontPage = ({ bounds }) => {
  var opts = {
    bounds,
    width: 400,
    height: 400,
    dpi: 4
  }

  return (
    <Image cache={true} src={api.getMapImageURL(opts)} />
  )
}

  var sw = [180, 90]
  var ne = [-180, -90]
  observations.forEach((obs) => {
    sw[0] = Math.min(obs.lon, sw[0])
    sw[1] = Math.min(obs.lat, sw[1])
    ne[0] = Math.max(obs.lon, ne[0])
    ne[1] = Math.max(obs.lat, ne[1])
  })
  var bounds = [sw[0], sw[1], ne[0], ne[1]]
  <Page key="front" size="A4" style={styles.page}>
    <FrontPage bounds={bounds} />
  </Page>
*/

// These are global to avoid re-using the same context in multiple renderers
// (e.g. if we are displaying a PDF preview and also saving at the same time)
const instance = pdf({})
const queue = new PQueue({ concurrency: 1 })

function renderToBlob (doc) {
  instance.updateContainer(doc)
  return queue.add(() => instance.toBlob())
}

export function renderPDFReport (
  props: ReportProps
): Promise<{ blob: Blob, index: Array<string> }> {
  let pageIndex: Array<string> = []
  const doc = (
    <PDFReport {...props} onPageIndex={index => (pageIndex = index)} />
  )
  return renderToBlob(doc).then(blob => ({ blob, index: pageIndex }))
}

export const PDFReport = ({
  intl,
  settings = defaultSettings,
  onPageIndex,
  observations,
  getPreset,
  getMedia,
  mapStyle,
  mapboxAccessToken
}: ReportProps) => {
  // **Assumption: Each observation will be max 3 pages**
  const sparsePageIndex = new Array(observations.length * 3).fill(undefined)
  let didCallback = false

  // This will be called once for each observation without the totalPages, then
  // called once for each observation with totalPages set. For each render of
  // this componenent, onPageIndex will be called once with the index & totalPages
  function handleRenderObservation ({ id, pageNumber, totalPages }) {
    sparsePageIndex[pageNumber - 1] = id
    if (typeof totalPages === 'number' && !didCallback && onPageIndex) {
      didCallback = true
      const pageIndex = sparsePageIndex
        .slice(0, totalPages)
        .map((id, i, arr) => id || arr[i - 1])
      // $FlowFixMe - The slice() and map() removes undefined elements
      onPageIndex(pageIndex)
    }
  }

  const children = (
    <SettingsContext.Provider value={settings}>
      <Document>
        {observations.map(observation => {
          const view = new ObservationView({
            observation,
            getPreset,
            getMedia,
            mapStyle,
            mapboxAccessToken
          })
          return (
            <FeaturePage
              key={observation.id}
              observationView={view}
              onRender={handleRenderObservation}
            />
          )
        })}
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

const FeaturePage = ({
  observationView: view,
  onRender
}: {
  observationView: ObservationView,
  onRender: (props: {
    id: string,
    pageNumber: number,
    totalPages: number
  }) => void
}) => {
  // TODO: move all of these Views into ObservationView
  return (
    <Page size='A4' style={styles.page} wrap>
      <Indexer id={view.id} onRender={onRender} />
      <View style={styles.pageContent}>
        <View style={styles.columnLeft}>
          <Text style={styles.presetName}>
            {view.preset.name || 'Observation'}
          </Text>
          <ObsCreated view={view} />
          <ObsLocation view={view} />
          <ObsDescription view={view} />
          <ObsDetails view={view} />
        </View>
        <View style={styles.columnRight}>
          <ObsInsetMap view={view} />
          {view.mediaItems.map((src, i) => (
            <ObsImage key={i} src={src} />
          ))}
        </View>
      </View>
    </Page>
  )
}
/** Render an empty text node so that we can use the callback to
  read the page number and total pages */
const Indexer = ({ id, onRender }) => (
  <View>
    <Text
      render={({ pageNumber, totalPages }) => {
        onRender({
          id,
          pageNumber,
          totalPages
        })
        return ''
      }}
    />
  </View>
)

const ObsCreated = ({ view }: { view: ObservationView }) =>
  view.createdAt ? (
    <Text style={styles.createdAt}>
      <Text style={styles.createdAtLabel}>
        <FormattedMessage {...m.dateHeader} />:{' '}
      </Text>
      <FormattedTime
        key='time'
        value={view.createdAt}
        year='numeric'
        month='long'
        day='2-digit'
      />
    </Text>
  ) : null

const ObsLocation = ({ view }: { view: ObservationView }) =>
  view.coords ? (
    <Text style={styles.location}>
      <Text style={styles.locationLabel}>
        <FormattedMessage {...m.locationHeader} />:{' '}
      </Text>
      <FormattedLocation {...view.coords} />
    </Text>
  ) : null

const ObsDescription = ({ view }: { view: ObservationView }) =>
  view.note ? (
    <View>
      {view.note.split('\n').map((para, idx) => (
        <Text key={idx} style={styles.description}>
          {para}
        </Text>
      ))}
    </View>
  ) : null

function ObsDetails ({ view }: { view: ObservationView }) {
  const { formatMessage: t } = useIntl()
  const nonEmptyFields = view.fields.filter(field => {
    const value = get(view.tags, field.key)
    return !isEmptyValue(value)
  })
  if (nonEmptyFields.length === 0) return null
  return (
    <>
      <Text style={styles.details}>{t(m.detailsHeader)}</Text>
      {nonEmptyFields.map(field => (
        <View key={field.id} style={styles.field} wrap={false}>
          <Text style={styles.fieldLabel}>
            <FormattedFieldProp field={field} propName='label' />
          </Text>
          <Text style={styles.fieldValue}>
            <FormattedFieldValue
              field={field}
              value={get(view.tags, field.key)}
            />
          </Text>
        </View>
      ))}
    </>
  )
}

const ObsInsetMap = ({ view }: { view: ObservationView }) => {
  var imageSrc = view.getMapImageURL()
  if (!imageSrc) return null
  return (
    <View style={styles.imageWrapper} wrap={false}>
      <Image
        src={imageSrc}
        key={'minimap-' + view.id}
        style={styles.image}
        cache={true}
      />
      <View style={styles.marker} />
    </View>
  )
}

const ObsImage = ({ src }: { src: string }) => (
  <View style={styles.imageWrapper} wrap={false}>
    <Image cache={true} src={src} style={styles.image} />
  </View>
)

class ObservationView {
  static DEFAULT_ZOOM_LEVEL = 11
  id: string
  coords: { longitude: number, latitude: number } | void
  createdAt: Date | void
  fields: Field[]
  tags: Object
  mediaItems: ImageMediaItem[]
  note: string
  preset: PresetWithAdditionalFields
  mapboxAccessToken: $PropertyType<MapViewContentProps, 'mapboxAccessToken'>
  mapStyle: $PropertyType<MapViewContentProps, 'mapStyle'>

  constructor ({
    observation,
    getPreset,
    getMedia,
    mapStyle,
    mapboxAccessToken
  }) {
    this.mapStyle = mapStyle
    this.mapboxAccessToken = mapboxAccessToken
    this.id = observation.id
    this.coords =
      typeof observation.lon === 'number' && typeof observation.lat === 'number'
        ? {
            longitude: observation.lon,
            latitude: observation.lat
          }
        : undefined
    this.createdAt =
      typeof observation.created_at === 'string'
        ? new Date(observation.created_at)
        : undefined

    this.preset = getPreset(observation)
    // $FlowFixMe - need to create Fields type
    this.fields = this.preset.fields.concat(this.preset.additionalFields)
    this.tags = observation.tags || {}
    this.note = this.tags.note || this.tags.notes
    this.mediaItems = (observation.attachments || []).reduce((acc, cur) => {
      const item = getMedia(cur, { width: 800, height: 600 })
      if (item && item.type === 'image') acc.push(item.src)
      return acc
    }, [])
  }

  getMapImageURL (zoom) {
    if (!zoom) zoom = ObservationView.DEFAULT_ZOOM_LEVEL
    if (!this.coords) return null

    var opts = {
      width: 250,
      height: 250,
      lon: this.coords.longitude,
      lat: this.coords.latitude,
      zoom: 11,
      dpi: 2,
      style: this.mapStyle,
      accessToken: this.mapboxAccessToken
    }
    return api.getMapImageURL(opts)
  }
}

// Convert pixel to millimetres
function mm (v) {
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
  image: {
    objectFit: 'contain',
    bottom: 0,
    right: 0,
    top: 0,
    left: 0,
    position: 'absolute'
  },
  marker: {
    position: 'absolute',
    width: '4mm',
    height: '4mm',
    borderRadius: '2mm',
    top: '28mm',
    left: '28mm',
    backgroundColor: 'red'
  },
  imageWrapper: {
    width: '60mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    paddingBottom: '100%',
    height: 0,
    position: 'relative',
    overflow: 'hidden'
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
