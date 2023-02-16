//
import isodate from '@segment/isodate'
import sexagesimal from '@mapbox/sexagesimal'
import url from 'url'
import mime from 'mime/lite'

import * as valueTypes from '../../constants/value_types'

import { parseDateString } from '../../utils/helpers'

// Match dates of the form 1999-12-31
const shortDateRegExp = /^(\d{4})-(\d{2})-(\d{2})$/

const TYPES = {
  boolean: valueTypes.BOOLEAN,
  number: valueTypes.NUMBER,
  undefined: valueTypes.UNDEFINED
}

/**
 * Guess the type of a value:
 * - primitive types (excluding Symbol)
 * - dates
 * - urls (guessing contentType from extension)
 */
export function guessValueType (value) {
  if (Array.isArray(value)) return valueTypes.ARRAY
  if (value === null) return valueTypes.NULL
  if (typeof value !== 'string') return TYPES[typeof value]

  if (isUrl(value)) {
    // eslint-disable-next-line node/no-deprecated-api
    const parsedUrl = url.parse(value)
    if (!parsedUrl.pathname) return valueTypes.URL
    const mimeType = mime.getType(parsedUrl.pathname)
    if (!mimeType) return valueTypes.URL
    if (mimeType.split('/')[0] === 'image') return valueTypes.IMAGE_URL
    if (mimeType.split('/')[0] === 'video') return valueTypes.VIDEO_URL
    if (mimeType.split('/')[0] === 'audio') return valueTypes.AUDIO_URL
    return valueTypes.URL
  }

  // Test date last because this is the most expensive
  if (isShortDate(value)) return valueTypes.DATE
  if (isodate.is(value)) return valueTypes.DATETIME

  return valueTypes.STRING
}

// This seems rather complicated, but all these declares tell Flow that the
// returned type of the function depends on the `type` argument passed to the
// coerceValue function
/* eslint-disable no-redeclare */

/* eslint-enable no-redeclare */

/**
 * Attempts to coerce a value to `type`, throws if it can't coerce
 */
// eslint-disable-next-line no-redeclare
export function coerceValue (value, type) {
  if (value === undefined || value === null) return value
  switch (type) {
    case valueTypes.UNDEFINED:
      return
    case valueTypes.NULL:
      return null
    case valueTypes.LOCATION: {
      const parsedLocation = parseLocation(value)
      if (parsedLocation) return parsedLocation
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
    }
    case valueTypes.ARRAY:
      if (Array.isArray(value)) return value
      // If string assume either comma-separated or space-separated - choose the
      // one that results in the largest number of values
      if (typeof value === 'string') {
        const spaceSplit = value.split(' ')
        const commaSplit = value.split(',')
        return commaSplit.length >= spaceSplit.length ? commaSplit : spaceSplit
      }
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
    case valueTypes.BOOLEAN:
      if (typeof value === 'boolean') return value
      if (typeof value === 'number') return !!value
      if (typeof value === 'string') {
        const parsedBool = parseBoolean(value)
        if (parsedBool !== null) return parsedBool
      }
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
    case valueTypes.NUMBER:
      if (typeof value === 'number') return value
      if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value)
      }
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
    case valueTypes.STRING:
      if (typeof value === 'string') return value
      if (typeof value === 'boolean') return value ? 'yes' : 'no'
      if (typeof value === 'number') return value + ''
      if (Array.isArray(value))
        return value.map(v => coerceValue(v, valueTypes.STRING)).join(',')
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
    case valueTypes.DATE:
    case valueTypes.DATETIME: {
      if (typeof value === 'number') return new Date(value)
      if (typeof value !== 'string')
        throw new Error(
          'Cannot coerce ' + JSON.stringify(value) + ' to ' + type
        )
      const parsedDateValue = parseDateString(value)
      if (typeof parsedDateValue === 'undefined')
        throw new Error(
          'Cannot coerce ' + JSON.stringify(value) + ' to ' + type
        )
      return parsedDateValue
    }
    case valueTypes.IMAGE_URL:
    case valueTypes.URL:
    case valueTypes.VIDEO_URL:
    case valueTypes.AUDIO_URL:
      if (typeof value === 'string' && isUrl(value)) return value
      throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
  }
  throw new Error('Cannot coerce ' + JSON.stringify(value) + ' to ' + type)
}

const TRUE_STRINGS = ['yes', 'true', '1']
const FALSE_STRINGS = ['no', 'false', '0']

function parseBoolean (value) {
  const v = value.toLowerCase().trim()
  if (TRUE_STRINGS.indexOf(v) > -1) return true
  if (FALSE_STRINGS.indexOf(v) > -1) return false
  return null
}

/**
 * Parses location from one of:
 * - a string location record from an ODK form
 * - a sexagesimal pair e.g. `66N 32W`
 * - an array [lon, lat] of either numbers or strings which can be coerced to numbers
 */
function parseLocation (value) {
  if (typeof value === 'string') {
    var parsed = sexagesimal.pair(value)
    if (parsed) return [parsed[1], parsed[0]]
    const parts = value.split(' ')
    // ODK location is a string like `-77.23 2.24 10 200` (lon, lat, accuracy, altitude)
    if (parts.length !== 4) return null
    if (parts.every(isFloat) && withinBounds(+parts[0], +parts[1])) {
      return parts.map(parseFloat).slice(0, 2)
    }
  } else if (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(isFloat) &&
    withinBounds(+value[0], +value[1])
  ) {
    return value.map(parseFloat).slice(0, 2)
  }
  return null
}

// Stricter parsing function, from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
function isFloat (value) {
  if (typeof value === 'number') return true
  return /^(-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)
}

function isShortDate (value) {
  return shortDateRegExp.test(value)
}

// Check whether a location is within bounds
function withinBounds (lon, lat) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

function isUrl (url) {
  return url.startsWith('https://') || url.startsWith('http://')
}
