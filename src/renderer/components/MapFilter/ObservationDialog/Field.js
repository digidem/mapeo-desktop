import React from 'react'
import { useIntl } from 'react-intl'
import { SelectOne, SelectMultiple } from './Select'
import TextField from './TextField'
import NumberField from './NumberField'
import DateField from './DateField'
import DateTimeField from './DateTimeField'

import * as valueTypes from '../constants/value_types'
import { coerceValue } from '../lib/data_analysis/value_types'
import { getLocalizedFieldProp } from '../utils/strings'
import FormattedFieldname from '../internal/FormattedFieldname'

const Field = ({ field, value, onChange }) => {
  const { locale } = useIntl()
  const label = <FormattedFieldname field={field} />
  const placeholder = getLocalizedFieldProp(field, 'placeholder', locale)
  const handleChange = newValue => {
    onChange(field.key, newValue)
  }

  switch (field.type) {
    // `textarea` is for legacy support of presets that use the iD presets
    // schema. mapeo-schema uses type `text` with `appearance=multiline` for
    // text areas (the default) and `appearance=singleline` for forcing fields
    // to a single line. eslint-disable-next-line no-fallthrough
    case 'textarea':
    // `localized` fields are used in iD to add additional tags that append
    // `:LANG_CODE` to the property key for language translations, e.g.
    // `name:es` for a spanish translation of `name`. For now we will just show
    // the non-translated name as an editable text field (translated names will
    // appear as additional fields without the correct labels)
    // eslint-disable-next-line no-fallthrough
    case 'localized':
    case 'text': {
      // In mapeo-schema, text fields default to multiline appearance.
      const isMultiline = field.appearance !== 'singleline'
      return (
        <TextField
          value={coerceOrUndefined(value, valueTypes.STRING)}
          multiline={isMultiline}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    }
    case 'select_one': {
      // If value is an array (e.g. this could have been a select-multiple field
      // before) then the best we can do is show the array as a comma-separated
      // string, ignoring null and undefined values
      const coercedValue = Array.isArray(value)
        ? coerceOrUndefined(
            value.filter(v => v != null),
            valueTypes.STRING
          )
        : value
      return (
        <SelectOne
          value={coercedValue}
          options={field.options}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    }
    case 'select_multiple': {
      let coercedValue
      if (Array.isArray(value)) {
        // SelectMultiple does not accept undefined values as valid However we
        // accept null or empty strings here, on the assumption that if they
        // exist then this was intentional
        coercedValue = filterUndefined(value)
      } else if (value != null && value !== '') {
        // if value is null, undefined or an empty string, then coerced value is
        // undefined, otherwise value is turned into an array
        coercedValue = [value]
      }
      return (
        <SelectMultiple
          value={coercedValue}
          label={label}
          options={field.options}
          placeholder={placeholder}
          onChange={handleChange}
        />
      )
    }
    case 'number':
      return (
        <NumberField
          value={coerceOrUndefined(value, valueTypes.NUMBER)}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'date':
      return (
        <DateField
          value={coerceOrUndefined(value, valueTypes.DATE)}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'datetime':
      return (
        <DateTimeField
          value={coerceOrUndefined(value, valueTypes.DATETIME)}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    default:
      return (
        <TextField
          value={coerceOrUndefined(value, valueTypes.STRING)}
          disabled
          multiline
          label={label}
          placeholder={placeholder}
          handleChange={handleChange}
        />
      )
  }
}

export default Field

// Kind of frustrating types here. This function has almost the same type as
// coerceValue, but if passed a null value will return undefined
/* eslint-disable no-redeclare */

function coerceOrUndefined (value, type) {
  // Convert null value to undefined
  if (value === null) return
  try {
    return coerceValue(value, type)
  } catch (_) {
    // Return undefined if value cannot be coerced
  }
}
/* eslint-enable no-redeclare */

// Another hack for Flow not supporting Array.filter() correctly
// https://github.com/facebook/flow/issues/1414
function filterUndefined (arr) {
  return arr.reduce((acc, cur) => {
    if (cur !== undefined) acc.push(cur)
    return acc
  }, [])
}
