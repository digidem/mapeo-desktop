// @flow
import * as React from 'react'
import {
  IntlProvider,
  defineMessages,
  useIntl,
  FormattedTime,
  FormattedMessage
} from 'react-intl'
import {
  Page,
  Text as TextOrig,
  View,
  Image,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer'
import type { Field, Observation } from 'mapeo-schema'

import {
  FormattedFieldProp,
  FormattedFieldValue
} from '../internal/FormattedData'
import FormattedLocation from '../internal/FormattedLocation'
import { isEmptyValue } from '../utils/helpers'
import { formatId } from '../utils/strings'
import { get } from '../utils/get_set'
import type { ImageMediaItem } from '../ObservationDialog'
import type { PresetWithAdditionalFields } from '../types'
import {
  SettingsContext,
  defaultSettings,
  type SettingsContextType
} from '../internal/Context'
import { type MapViewContentProps } from '../MapView/MapViewContent'
import api from '../../../new-api'

import dateIcon from './iconEvent.png'
import fallbackCategoryIcon from './iconPlace.png'
import mapIcon from './iconObservationMarker.png'
import locationIcon from './iconLocation.png'

import sarabunLight from '../../../../../static/fonts/Sarabun-Light.ttf'
import sarabunLightItalic from '../../../../../static/fonts/Sarabun-LightItalic.ttf'
import sarabunRegular from '../../../../../static/fonts/Sarabun-Regular.ttf'
import sarabunItalic from '../../../../../static/fonts/Sarabun-Italic.ttf'
import sarabunMedium from '../../../../../static/fonts/Sarabun-Medium.ttf'
import sarabunMediumItalic from '../../../../../static/fonts/Sarabun-MediumItalic.ttf'
import sarabunBold from '../../../../../static/fonts/Sarabun-Bold.ttf'
import sarabunBoldItalic from '../../../../../static/fonts/Sarabun-BoldItalic.ttf'

import rubikBold from '../../../../../static/fonts/Rubik-Bold.ttf'
import rubikBoldItalic from '../../../../../static/fonts/Rubik-BoldItalic.ttf'
import rubikMedium from '../../../../../static/fonts/Rubik-Medium.ttf'
import rubikMediumItalic from '../../../../../static/fonts/Rubik-MediumItalic.ttf'
import rubikRegular from '../../../../../static/fonts/Rubik-Regular.ttf'
import rubikItalic from '../../../../../static/fonts/Rubik-Italic.ttf'
import rubikLight from '../../../../../static/fonts/Rubik-Light.ttf'
import rubikLightItalic from '../../../../../static/fonts/Rubik-LightItalic.ttf'

Font.register({
  family: 'Sarabun',
  fonts: [
    { src: sarabunLight, fontStyle: 'normal', fontWeight: 300 },
    { src: sarabunLightItalic, fontStyle: 'italic', fontWeight: 300 },
    { src: sarabunRegular, fontStyle: 'normal', fontWeight: 400 },
    { src: sarabunItalic, fontStyle: 'italic', fontWeight: 400 },
    { src: sarabunMedium, fontStyle: 'normal', fontWeight: 500 },
    { src: sarabunMediumItalic, fontStyle: 'italic', fontWeight: 500 },
    { src: sarabunBold, fontStyle: 'normal', fontWeight: 700 },
    { src: sarabunBoldItalic, fontStyle: 'italic', fontWeight: 700 }
  ]
})

Font.register({
  family: 'Rubik',
  fonts: [
    { src: rubikLight, fontStyle: 'normal', fontWeight: 300 },
    { src: rubikLightItalic, fontStyle: 'italic', fontWeight: 300 },
    { src: rubikRegular, fontStyle: 'normal', fontWeight: 400 },
    { src: rubikItalic, fontStyle: 'italic', fontWeight: 400 },
    { src: rubikMedium, fontStyle: 'normal', fontWeight: 500 },
    { src: rubikMediumItalic, fontStyle: 'italic', fontWeight: 500 },
    { src: rubikBold, fontStyle: 'normal', fontWeight: 700 },
    { src: rubikBoldItalic, fontStyle: 'italic', fontWeight: 700 }
  ]
})

const DEFAULT_FONT = 'Rubik'

// Our default font (Rubik) does not contain glyphs for all languages. There
// does not seem to be a suitable open font that contains glyphs for every
// language, therefore we need to change font family based on the current locale
const fontFamilyLocaleMapping = {
  th: 'Sarabun'
}

function getFontFamily (locale: string): string {
  return fontFamilyLocaleMapping[locale] || DEFAULT_FONT
}

const m = defineMessages({
  // Label for description / notes section of report
  descriptionLabel: 'Description',
  // Shown in reports if an observation has no location recorded
  noLocation: 'No Location Recorded',
  // Page number in footer
  pageNumber: 'Page {pageNumber}'
})

export type ReportProps = {
  observationsWithPresets: Array<{|
    observation: Observation,
    preset: PresetWithAdditionalFields,
    mediaSources: {
      [id: string]: { src: string, type: 'image' | 'video' | 'audio' } | void
    }
  |}>,
  locale?: 'string',
  messages?: any,
  /** Rendering a PDF does not inherit context from the parent tree. Get this
   * value with React.useContext(SettingsContext) and provide it as a prop */
  settings?: SettingsContextType,
  /** Called with an index of ids, position in array is page number */
  onPageIndex?: (index: Array<string>) => any,
  /** For previews, the page number the preview section starts on (e.g. first
   * observation starts on page 1, if that 1st observation takes two pages, then
   * pdf preview of second observation starts on page 3). Do not use for final
   * render */
  startPage?: number,
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
  <Page key="front" size="A4" style={s.page}>
    <FrontPage bounds={bounds} />
  </Page>
*/

const Text = ({
  style,
  ...otherProps
}: React.ElementConfig<typeof TextOrig>) => {
  const intl = useIntl()
  const fontFamily = getFontFamily(intl.locale)
  return <TextOrig style={{ fontFamily, ...style }} {...otherProps} />
}

export const PDFReport = ({
  settings = defaultSettings,
  onPageIndex,
  observationsWithPresets,
  locale = 'en',
  messages,
  mapStyle,
  mapboxAccessToken,
  startPage = 1
}: ReportProps) => {
  // **Assumption: Each observation will be max 3 pages**
  const sparsePageIndex = new Array(observationsWithPresets.length * 3).fill(
    undefined
  )
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

  return (
    <IntlProvider locale={locale} messages={messages}>
      <SettingsContext.Provider value={settings}>
        <Document>
          {observationsWithPresets.map(
            ({ observation, preset, mediaSources }) => {
              const view = new ObservationView({
                observation,
                preset,
                mediaSources,
                mapStyle,
                mapboxAccessToken
              })
              return (
                <FeaturePage
                  key={observation.id}
                  observationView={view}
                  onRender={handleRenderObservation}
                  startPage={startPage}
                />
              )
            }
          )}
        </Document>
      </SettingsContext.Provider>
    </IntlProvider>
  )
}

const FeaturePage = ({
  observationView: view,
  onRender,
  startPage
}: {
  observationView: ObservationView,
  onRender: (props: {
    id: string,
    pageNumber: number,
    totalPages: number
  }) => void,
  startPage: number
}) => {
  const intl = useIntl()
  // TODO: move all of these Views into ObservationView
  return (
    <Page size='A4' style={s.page} wrap>
      <Indexer id={view.id} onRender={onRender} />
      <View style={s.pageContent}>
        <View style={s.header}>
          <View style={s.row}>
            <View style={[s.col, s.span2, s.headerContent]}>
              <View style={[s.headerRow, s.titleRow]}>
                <ObservationIcon view={view} />
                <Text style={s.presetName}>
                  {view.preset.name || 'Observation'}
                </Text>
              </View>
              <TitleDetails icon={<Image src={locationIcon} style={s.icon} />}>
                <ObsLocation view={view} />
              </TitleDetails>
              <TitleDetails icon={<Image src={dateIcon} style={s.icon} />}>
                <ObsCreated view={view} />
              </TitleDetails>
              <TitleDetails icon={<IdIcon />}>{formatId(view.id)}</TitleDetails>
            </View>
            <View style={[s.col]}>
              <ObsInsetMap view={view} />
            </View>
          </View>
        </View>
        <View style={s.row}>
          <View style={[s.col, s.span2]}>
            <View style={s.row}>
              <ObsDescription view={view} />
            </View>
            <ObsDetails view={view} />
          </View>
          <View style={[s.col, s.mediaList]}>
            {view.mediaItems.map((src, i) => (
              <ObsImage key={i} src={src} />
            ))}
          </View>
        </View>
      </View>
      <View style={s.footer} fixed>
        <Text>
          <FormattedTime
            key='time'
            value={new Date()}
            year='numeric'
            month='long'
            day='2-digit'
          />
        </Text>
        <View
          style={
            // There is a bug in react-pdf where the render part of Text does
            // not seem to take up any space.
            { width: 100 }
          }
        >
          <Text
            fixed
            style={{
              textAlign: 'right'
            }}
            render={({ pageNumber }) =>
              intl.formatMessage(m.pageNumber, {
                pageNumber: startPage - 1 + pageNumber
              })
            }
          />
        </View>
      </View>
    </Page>
  )
}
/** Render an empty text node so that we can use the callback to
  read the page number and total pages */
const Indexer = ({ id, onRender }) => (
  <View>
    <TextOrig
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

const TitleDetails = ({
  icon,
  children
}: {
  icon: React.Node,
  children: React.Node
}) => (
  <View style={s.headerRow}>
    <View style={s.iconContainer}>{icon}</View>
    <Text style={s.titleDetails}>{children}</Text>
  </View>
)

const ObservationIcon = ({ view }: { view: ObservationView }) => {
  const iconUrl = view.getIconURL() || fallbackCategoryIcon
  return (
    <View style={s.iconContainer}>
      <View style={s.circle}>
        <Image cache style={s.categoryIcon} src={iconUrl} />
      </View>
    </View>
  )
}

const IdIcon = () => (
  <View style={s.idIcon}>
    <Text>ID</Text>
  </View>
)

const ObsCreated = ({ view }: { view: ObservationView }) => (
  <FormattedTime
    value={view.createdAt}
    year='numeric'
    month='long'
    day='2-digit'
  />
)

const ObsLocation = ({ view }: { view: ObservationView }) =>
  view.coords ? (
    <FormattedLocation {...view.coords} />
  ) : (
    <FormattedMessage {...m.noLocation} />
  )

const ObsDescription = ({ view }: { view: ObservationView }) =>
  view.note ? (
    <View style={[s.col, s.descriptionWrapper]}>
      <Text style={s.fieldLabel}>
        <FormattedMessage {...m.descriptionLabel} />
      </Text>
      {view.note.split('\n').map((para, idx) => (
        <Text key={idx} style={s.description}>
          {para}
        </Text>
      ))}
    </View>
  ) : null

function ObsDetails ({ view }: { view: ObservationView }) {
  const nonEmptyFields = view.fields.filter(field => {
    const value = get(view.tags, field.key)
    return !isEmptyValue(value)
  })
  if (nonEmptyFields.length === 0) return null
  return (
    <View style={[s.row, s.fieldsWrapper]}>
      {nonEmptyFields.map(field => (
        <View key={field.id} style={[s.col, s.field]} wrap={false}>
          <Text style={s.fieldLabel}>
            <FormattedFieldProp field={field} propName='label' />
          </Text>
          <Text style={s.fieldValue}>
            <FormattedFieldValue
              field={field}
              value={get(view.tags, field.key)}
            />
          </Text>
        </View>
      ))}
    </View>
  )
}

const ObsInsetMap = ({ view }: { view: ObservationView }) => {
  var imageSrc = view.getMapImageURL()
  if (!imageSrc) return null
  return (
    <View style={s.mapWrapper} wrap={false}>
      <Image src={imageSrc} key={'minimap-' + view.id} style={s.map} cache />
      <Image src={mapIcon} style={s.marker} />
    </View>
  )
}

const ObsImage = ({ src }: { src: string }) => (
  <View style={s.imageWrapper} wrap={false}>
    <Image cache src={src} style={s.image} />
  </View>
)

class ObservationView {
  static DEFAULT_ZOOM_LEVEL = 11
  id: string
  coords: { longitude: number, latitude: number } | void
  createdAt: Date
  fields: Field[]
  tags: Object
  mediaItems: ImageMediaItem[]
  note: string
  preset: PresetWithAdditionalFields
  mapboxAccessToken: $PropertyType<MapViewContentProps, 'mapboxAccessToken'>
  mapStyle: $PropertyType<MapViewContentProps, 'mapStyle'>

  constructor ({
    observation,
    preset,
    mediaSources,
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
    this.createdAt = new Date(observation.created_at)

    this.preset = preset
    // $FlowFixMe - need to create Fields type
    this.fields = this.preset.fields.concat(this.preset.additionalFields)
    this.tags = observation.tags || {}
    this.note = this.tags.note || this.tags.notes
    this.mediaItems = (observation.attachments || []).reduce((acc, cur) => {
      const item = mediaSources[cur.id]
      if (item && item.type === 'image') acc.push(item.src)
      return acc
    }, [])
  }

  getIconURL (size?: 'medium') {
    if (!api.getBaseUrl()) return // for rendering in storybook
    if (!this.preset.icon) return
    return api.getIconUrl(this.preset.icon)
  }

  getMapImageURL (zoom) {
    if (!zoom) zoom = ObservationView.DEFAULT_ZOOM_LEVEL
    if (!this.coords) return null

    var opts = {
      width: HEADER_HEIGHT * 1.5,
      height: HEADER_HEIGHT,
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

const HEADER_HEIGHT = 110
const MARKER_WIDTH = 24
// Marker is 110px x 188px
const MARKER_HEIGHT = 188 * (24 / 110)
// Offset of marker map center from top of marker as ratio to height
const MARKER_VERTICAL_OFFSET = 138 / 188
const BORDER_RADIUS = 10

const s = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingLeft: 36,
    paddingRight: 36,
    flexDirection: 'column'
  },
  pageContent: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    height: HEADER_HEIGHT,
    borderWidth: 0.5,
    borderColor: 'black',
    borderStyle: 'solid',
    borderRadius: BORDER_RADIUS,
    marginBottom: 20
  },
  headerContent: {
    padding: 8,
    paddingRight: 0
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  titleRow: {
    marginBottom: 5
  },
  iconContainer: {
    width: 30,
    minHeight: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    width: 14
  },
  idIcon: {
    backgroundColor: 'black',
    borderRadius: 3,
    padding: '1 3',
    fontSize: 8,
    fontWeight: 500,
    color: 'white'
  },
  categoryIcon: {
    width: 20
  },
  circle: {
    borderRadius: 15,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#bbbbbb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    marginLeft: -10,
    marginRight: -10
  },
  col: {
    marginLeft: 10,
    marginRight: 10,
    flex: 1
  },
  span2: {
    flex: 2
  },
  mediaList: {
    flexDirection: 'column',
    marginTop: -5,
    marginBottom: -5
  },
  presetName: {
    fontWeight: 500,
    fontSize: 16,
    lineHeight: 1.4
  },
  titleDetails: {
    fontSize: 11
  },
  image: {
    objectFit: 'contain',
    width: '100%'
  },
  map: {
    borderBottomRightRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    objectFit: 'cover',
    width: '100%',
    backgroundColor: '#D7E2CC'
  },
  mapWrapper: {
    position: 'relative'
  },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    height: MARKER_HEIGHT,
    // Center the marker
    top: '50%',
    left: '50%',
    marginTop: -MARKER_VERTICAL_OFFSET * MARKER_HEIGHT,
    marginLeft: -12
  },
  imageWrapper: {
    // This affects portrait photos
    maxHeight: 140,
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: 'black',
    marginBottom: 5,
    marginTop: 5
  },
  description: {
    marginBottom: 6,
    fontSize: 12
  },
  descriptionWrapper: {
    marginBottom: 20
  },
  fieldsWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: -4,
    marginBottom: -4,
    flex: 1
  },
  field: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'column',
    width: '30%',
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: '30%'
  },
  fieldLabel: {
    fontSize: 7,
    marginBottom: 1,
    textTransform: 'uppercase',
    fontWeight: 500,
    lineHeight: 1.3,
    color: '#666666'
    // borderBottomWidth: 0.5,
    // borderBottomStyle: 'solid',
    // borderBottomColor: 'black'
  },
  fieldValue: {
    fontSize: 11,
    fontWeight: 400,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    fontSize: 8,
    lineHeight: 1,
    textTransform: 'uppercase',
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})
