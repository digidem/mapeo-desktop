// @flow
import * as React from 'react'
import * as valueTypes from './constants/value_types'
import type {
  Observation,
  Preset,
  TextField,
  NumberField,
  DateField,
  SelectOneField,
  SelectMultipleField,
  LinkField,
  DateTimeField
} from 'mapeo-schema'
// import type { Properties as CSSProperties } from 'csstype'

import type {
  // FeatureCollectionTemplate,
  Bbox,
  Point2D,
  Point3D
} from 'flow-geojson'

export type {
  Key,
  TextField,
  NumberField,
  DateField,
  SelectOneField,
  SelectMultipleField,
  LinkField,
  SelectableFieldValue,
  LabeledSelectOption,
  SelectOptions,
  DateTimeField
} from 'mapeo-schema'

/**
 * Observation Attachment
 */
export type Attachment = $ElementType<
  $NonMaybeType<$ElementType<Observation, 'attachments'>>,
  number
>

// export type StyleProp = CSSProperties<string | number>

// Almost JSON value, but we can also have 'undefined' as a value
export type JSONValue =
  | void
  | null
  | number
  | string
  | boolean
  | JSONObject // eslint-disable-line no-use-before-define
  | JSONArray // eslint-disable-line no-use-before-define
export type JSONObject = { [key: string]: JSONValue }
type JSONArray = Array<JSONValue>
type Properties = JSONObject | null

type FlattenedProperties = {
  [key: string]: null | number | string | boolean
} | null
// type FlattenedPropertiesArray = {
//   [key: string]: null | number | string | boolean | JSONArray
// } | null

type FeatureTemplate<G, P> = {
  id?: string | number,
  type: 'Feature',
  bbox?: Bbox,
  properties: P,
  geometry: G
}

type FeatureTemplateWithId<G, Properties> = FeatureTemplate<G, Properties> & {
  id: string | number
}

export type PointFeature = FeatureTemplate<Point2D | Point3D | null, Properties>

export type PointFeatureWithId = FeatureTemplateWithId<
  Point2D | Point3D | null,
  Properties
>

export type FlattenedPointFeature = FeatureTemplate<
  Point2D | Point3D | null,
  FlattenedProperties
>

// export type FeatureCollection = FeatureCollectionTemplate<PointFeature>

export type PaperSize = 'a4' | 'letter'

// Used to store state about field visibility in views
export type FieldState = Array<{|
  id: string,
  hidden: boolean,
  label: React.Node
|}>
export type Filter = Array<number | string | boolean | null | Array<Filter>>

export type ValueTypes = { [fieldkey: string]: $Values<typeof valueTypes> }

export type FieldOrder = { [fieldkey: string]: number }

export type Classes<S> = { [className: $Keys<S>]: string }

export type StringStatistic = {|
  count: number,
  lengthMin?: number,
  lengthMax?: number,
  lengthVariance?: number,
  lengthMean?: number,
  wordsMin?: number,
  wordsMax?: number,
  wordsVariance?: number,
  wordsMean?: number,
  values: Map<string, number>
|}

export type NumberStatistic = {|
  count: number,
  min?: number,
  max?: number,
  variance?: number,
  mean?: number,
  values: Map<number, number>
|}

export type DateStatistic = {|
  count: number,
  min?: string,
  max?: string,
  mean?: string,
  values: Map<string, number>
|}

export type NonArrayFieldStatistic = {|
  string: StringStatistic,
  boolean: {|
    count: number,
    values: Map<boolean, number>
  |},
  number: NumberStatistic,
  date: DateStatistic,
  datetime: DateStatistic,
  url: number,
  image: number,
  video: number,
  audio: number,
  null: number,
  undefined: number,
  location: number
|}

export type FieldStatistic = {|
  ...$Exact<NonArrayFieldStatistic>,
  array?: {|
    count: number,
    lengthMin: number,
    lengthMax: number,
    valueStats: FieldStatistic
  |}
|}

export type Statistics = { [fieldname: string]: FieldStatistic }

type MediaType =
  | typeof valueTypes.IMAGE_URL
  | typeof valueTypes.AUDIO_URL
  | typeof valueTypes.VIDEO_URL
export type MediaArray = Array<{ src: string, type: MediaType }>

export type Coordinates = {
  altitude?: number,
  heading?: number,
  longitude: number,
  speed?: number,
  latitude: number,
  accuracy?: number
}

export type Field =
  | TextField
  | NumberField
  | SelectOneField
  | SelectMultipleField
  | DateField
  | DateTimeField
  | LinkField

export type MessageDescriptor = {
  id: string,
  description?: string | {},
  defaultMessage?: string
}

type IntlConfig = {|
  locale?: string,
  timeZone?: string,
  textComponent?: any,
  messages?: { [key: string]: string },
  defaultLocale: string,
  onError?: (err: string) => void
|}

type FormatDateOptions = {|
  localeMatcher?: 'lookup' | 'best fit',
  timeZone?: string,
  hour12?: boolean,
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24',
  formatMatcher?: 'basic' | 'best fit',
  weekday?: 'long' | 'short' | 'narrow',
  era?: 'long' | 'short' | 'narrow',
  year?: 'numeric' | '2-digit',
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow',
  day?: 'numeric' | '2-digit',
  hour?: 'numeric' | '2-digit',
  minute?: 'numeric' | '2-digit',
  second?: 'numeric' | '2-digit',
  timeZoneName?: 'long' | 'short'
|}

type oneToTwenty =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20

type FormatNumberOptions = {|
  localeMatcher?: 'lookup' | 'best fit',
  style?: 'decimal' | 'currency' | 'percent',
  currenty?: string,
  currencyDisplay?: 'symbol' | 'code' | 'name',
  useGrouping?: boolean,
  minimumIntegerDigits?: oneToTwenty | 21,
  minimumFractionDigits?: 0 | oneToTwenty,
  maximumFractionDigits?: 0 | oneToTwenty,
  minimumSignificantDigits?: oneToTwenty | 21,
  maximumSignificantDigits?: oneToTwenty | 21
|}

type FormatRelativeOptions = {|
  localeMatcher?: 'lookup' | 'best fit',
  numeric?: 'always' | 'auto',
  type?: 'long' | 'short' | 'narrow'
|}

type Unit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

type FormatPluralOptions = {
  type?: 'cardinal' | 'ordinal'
}

export type Primitive = string | boolean | null | void | number

type MessageValues = { [key: string]: Primitive }
type IntlFormatters = {|
  formatDate: (value: number | Date, opts?: FormatDateOptions) => string,
  formatTime: (value: number | Date, opts?: FormatDateOptions) => string,
  formatRelativeTime: (
    value: number,
    unit: Unit,
    opts?: FormatRelativeOptions
  ) => string,
  formatNumber: (value: number, opts?: FormatNumberOptions) => string,
  formatPlural: (value: number, opts?: FormatPluralOptions) => string,
  formatMessage: (
    descriptor: MessageDescriptor,
    values?: MessageValues
  ) => string,
  formatHTMLMessage: (
    descriptor: MessageDescriptor,
    values?: MessageValues
  ) => string
|}

export type IntlShape = {|
  ...IntlConfig,
  ...IntlFormatters
|}

/** A function that receives an observation attachment and should return a URL
 * to retrieve the attachment */
export type GetMedia = (
  attachment: Attachment,
  options?: { width: number, height: number }
) => { src: string, type: 'image' | 'video' | 'audio' } | void

export type GetMediaUrl = (
  attachmentId: string,
  size: 'thumbnail' | 'preview' | 'original'
) => string

export type GetIconUrl = (iconId: string) => string

export type PresetWithFields = {
  ...$Exact<Preset>,
  fields: Field[]
}

export type PresetWithAdditionalFields = {
  ...$Exact<PresetWithFields>,
  additionalFields: Field[]
}

export type CameraOptions = {
  center: [number, number],
  zoom: number,
  bearing: number,
  pitch: number
}

export type CommonViewContentProps = {
  /** Array of observations to render */
  observations: Array<Observation>,
  /** Called with id of observation clicked, optionally with image index */
  onClick: (id: string, imageIndex?: number) => void,
  getPreset: Observation => PresetWithAdditionalFields,
  /**
   * For a given attachment, return `src` and `type`
   */
  getMedia: GetMedia
}
