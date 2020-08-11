// @flow
import * as valueTypes from '../../constants/value_types'
import { guessValueType } from './value_types'
import { flatObjectEntries } from '../../utils/flat_object_entries'
import { get } from '../../utils/get_set'

import type {
  JSONObject,
  FieldStatistic,
  Statistics,
  MediaArray,
  Field,
  TextField,
  LinkField,
  NumberField,
  DateField,
  DateTimeField,
  SelectOptions,
  SelectOneField,
  SelectMultipleField
} from '../../types'

export { default as createMemoizedStats } from './statistics'

const mediaTypes = [
  valueTypes.VIDEO_URL,
  valueTypes.AUDIO_URL,
  valueTypes.IMAGE_URL
]

function compareKeys (a, b) {
  return JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0]))
}

/**
 * Takes a JSON object and optional array of JSON objects and returns an array
 * of field definitions. The field definitions are guessed from the arguments
 * passed. The returned field definitions can be used to render fields for
 * editing the properties of the object.
 */
export function getFields (
  cur?: JSONObject = {},
  stats?: Statistics
): Array<Field> {
  const entries = stats ? flatStatsEntries(stats) : flatObjectEntries(cur)
  return entries.sort(compareKeys).reduce((acc, [keyArray]) => {
    const key = JSON.stringify(keyArray)
    const value = get(cur, keyArray)
    const fieldStats = stats && stats[key]
    const field = getField(keyArray, value, fieldStats)
    if (field) acc.push(field)
    return acc
  }, [])
}

export function getMedia (cur: JSONObject = {}): MediaArray {
  return flatObjectEntries(cur).reduce((acc, [keyArray, value]) => {
    const type = guessValueType(value)
    if (mediaTypes.includes(type)) {
      // $FlowFixMe flow does not understand type is only media type here
      acc.push({ src: value, type })
    }
    return acc
  }, [])
}

export function getField (
  keyArray: Array<string | number>,
  value: any,
  fieldStats?: FieldStatistic
): Field {
  const valueType = guessValueType(value)
  // Initial implementation does not try to guess from statistics
  switch (valueType) {
    case valueTypes.BOOLEAN:
      return createSelectOneField(keyArray, [true, false])
    case valueTypes.STRING: {
      const options = getOptions(fieldStats)
      if (options.length) return createSelectOneField(keyArray, options)
      else return createTextField(keyArray)
    }
    case valueTypes.NUMBER:
      return createNumberField(keyArray)
    case valueTypes.ARRAY: {
      const options = getOptions(fieldStats)
      return createSelectMultipleField(
        keyArray,
        options.length ? options : value,
        { readonly: true }
      )
    }
    case valueTypes.DATE:
      return createDateField(keyArray, {
        min: fieldStats && fieldStats.date.min,
        max: fieldStats && fieldStats.date.max
      })
    case valueTypes.DATETIME:
      return createDateTimeField(keyArray, {
        min: fieldStats && fieldStats.date.min,
        max: fieldStats && fieldStats.date.max
      })
    case valueTypes.URL:
    case valueTypes.IMAGE_URL:
    case valueTypes.AUDIO_URL:
    case valueTypes.VIDEO_URL:
      return createLinkField(keyArray)
    default:
      return createTextField(keyArray, { readonly: true })
  }
}

// Don't include long strings in the options that can be selected
const MAX_OPTION_LENGTH = 30

function getOptions (fieldStats?: FieldStatistic): SelectOptions {
  const options = []
  if (!fieldStats) return options

  for (const value of fieldStats.string.values.keys()) {
    if (value.length > MAX_OPTION_LENGTH) continue
    options.push(value)
  }

  return options
}

function createTextField (
  keyArray: Array<string | number>,
  {
    readonly = false,
    appearance = 'single',
    snakeCase = false
  }: {
    readonly?: boolean,
    appearance?: 'single' | 'multiline',
    snakeCase?: boolean
  } = {}
): TextField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    appearance: appearance,
    type: 'text'
  }
}

function createLinkField (keyArray: Array<string | number>): LinkField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: true,
    type: 'link'
  }
}

function createNumberField (
  keyArray: Array<string | number>,
  { readonly = false }: { readonly?: boolean } = {}
): NumberField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    type: 'number'
  }
}

function createSelectOneField (
  keyArray: Array<string | number>,
  options: SelectOptions,
  {
    readonly = false,
    snakeCase = false
  }: { readonly?: boolean, snakeCase?: boolean } = {}
): SelectOneField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    type: 'select_one',
    options: options
  }
}

function createSelectMultipleField (
  keyArray: Array<string | number>,
  options: SelectOptions,
  {
    readonly = false,
    snakeCase = false
  }: { readonly?: boolean, snakeCase?: boolean } = {}
): SelectMultipleField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    type: 'select_multiple',
    options: options
  }
}

function createDateField (
  keyArray: Array<string | number>,
  {
    readonly = false,
    min,
    max
  }: {
    readonly?: boolean,
    snakeCase?: boolean,
    min?: string,
    max?: string
  } = {}
): DateField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    type: 'date',
    min_value: min,
    max_value: max
  }
}

function createDateTimeField (
  keyArray: Array<string | number>,
  {
    readonly = false,
    min,
    max
  }: {
    readonly?: boolean,
    snakeCase?: boolean,
    min?: string,
    max?: string
  } = {}
): DateTimeField {
  return {
    id: JSON.stringify([...arguments]),
    key: keyArray,
    readonly: readonly,
    type: 'datetime',
    min_value: min,
    max_value: max
  }
}

function flatStatsEntries (
  stats: Statistics
): Array<[Array<string | number>, FieldStatistic]> {
  // $FlowFixMe
  return Object.entries(stats).map(([key, value]) => [JSON.parse(key), value])
}
