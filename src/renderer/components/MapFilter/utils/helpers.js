//
import mime from 'mime/lite'

import { getFields as getFieldsFromTags } from '../lib/data_analysis'

export function isObj (value) {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

export function isImageAttachment (attachment) {
  const mimeType = attachment.type || mime.getType(attachment.id)
  return mimeType ? mimeType.split('/')[0] === 'image' : false
}

export function getLastImage (observation) {
  const imageAttachments = (observation.attachments || []).filter(
    isImageAttachment
  )
  if (!imageAttachments) return
  return imageAttachments[imageAttachments.length - 1]
}

const hiddenTags = {
  categoryId: true,
  notes: true,
  note: true
}

export function defaultGetPreset (observation, stats) {
  return {
    id: observation.id,
    geometry: ['point'],
    name: (observation.tags && observation.tags.name) || '',
    tags: {},
    fields: [],
    additionalFields: getFieldsFromTags(observation.tags, stats).filter(
      field => {
        // Hacky - change. Hide categoryId and notes fields.
        const fieldKey = Array.isArray(field.key) ? field.key[0] : field.key
        if (hiddenTags[fieldKey]) return false
        return true
      }
    )
  }
}

export function leftPad (str, len, char) {
  // doesn't need to pad
  len = len - str.length
  if (len <= 0) return str

  var pad = ''
  while (true) {
    if (len & 1) pad += char
    len >>= 1
    if (len) char += char
    else break
  }
  return pad + str
}

export function getDateString (date) {
  if (!(date instanceof Date)) return
  const YYYY = date.getFullYear()
  const MM = leftPad(date.getMonth() + 1 + '', 2, '0')
  const DD = leftPad(date.getDate() + '', 2, '0')
  return `${YYYY}-${MM}-${DD}`
}

const shortDateRegExp = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * This is necessary because Date.parse() of a string of the form 'YYYY-MM-DD'
 * will assume the timezone is UTC, so in different timezones the returned date
 * will not be what is expected.
 */
export function parseDateString (str) {
  if (!str) return
  const match = str.match(shortDateRegExp)
  if (!match) {
    const date = Date.parse(str)
    return Number.isNaN(date) ? undefined : new Date(date)
  }
  return new Date(+match[1], +match[2] - 1, +match[3])
}

export function isEmptyValue (value) {
  return (
    (typeof value === 'string' && value.length === 0) ||
    value === undefined ||
    value === null
  )
}
