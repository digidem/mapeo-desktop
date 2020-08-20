// @flow
import type { Field, Key } from '../types'
/**
 * Either returns the translated user-defined label for a field, or creates a
 * label from the field key by replacing _ and - with spaces and formatting in
 * title case
 * TODO: We ended up not using this syntax for translated fields. Translations
 * will be stored separately to the preset definitions.
 */
export function getLocalizedFieldProp (
  field: Field,
  prop: 'label' | 'placeholder',
  languageTag: string = 'en'
): string {
  // two-letter or three-letter ISO language code
  const languageCode = languageTag.split('-')[0]
  // choose most specific label translation available e.g. language tag with
  // country code first, then just language code, then label without language
  // specified
  const label =
    field[prop + ':' + languageTag] ||
    field[prop + ':' + languageCode] ||
    field[prop]
  return label
}

export function primitiveToString (
  value: string | boolean | number | null
): string {
  if (typeof value === 'string') return value
  // TODO: Create translatable strings
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') return value.toString()
  // TODO: what to show (translated) for "null" field (vs. undefined)
  if (value === null) return 'No Value'
  return ''
}

export function fieldKeyToLabel (key: Key): string | string[] {
  const fieldkey = typeof key === 'string' ? [key] : [...key]
  const labelArray = fieldkey.map(s => titleCase(s + ''))
  return labelArray.length === 1 ? labelArray[0] : labelArray
}

export function sentenceCase (str: string = '') {
  // Matches the first letter in the string and the first letter that follows a
  // period (and 1 or more spaces) and transforms that letter to uppercase.
  return str.replace(/(^[a-z])|(\.\s*[a-z])/g, str => str.toUpperCase())
}

/**
 * For a string written in camel_case or snake-case, or space-separated, return
 * string formatted in title case
 */
export function titleCase (str: string) {
  return str
    .toLowerCase()
    .split(/\s|_|-/)
    .map(word => capitalize(word))
    .join(' ')
}

export function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
