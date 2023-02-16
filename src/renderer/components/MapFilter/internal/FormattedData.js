//
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'

import { convertSelectOptionsToLabeled } from '../utils/fields'

const m = defineMessages({
  noAnswer: {
    // Keep original id to avoid re-translation
    id: 'screens.Observation.ObservationView.noAnswer',
    defaultMessage: 'No answer',
    description:
      'Placeholder text for fields on an observation which are not answered'
  }
})

// Render the translated value of a translatable Field property (one of
// `label`, `placeholder` or `helperText`). `label` will always render
// something: if it is undefined or an empty string, then it will use the field
// key as the label. `placeholder` and `helperText` will render to null if they
// are not defined.
export const FormattedFieldProp = ({ field, propName }) => {
  const { formatMessage: t } = useIntl()
  const fieldKey = Array.isArray(field.key) ? field.key[0] : field.key
  const value = field[propName]
    ? t({
        id: `fields.${field.id}.${propName}`,
        defaultMessage: field[propName]
      })
    : // Never show a blank label, fall back to field.key, otherwise return null
    propName === 'label'
    ? fieldKey
    : undefined
  if (!value) return null
  return <>{value}</>
}

// Render a field value as a string. If the value is an array, convert to string
// and join with `, `. If the field is a select_one or select_multiple field,
// then use `field.option.label` to display the value, if a label is defined.
// Translate the field value if a translation is defined.
//
// TODO: Consider an API like
// https://formatjs.io/docs/react-intl/components#formatteddateparts to enable
// formatting of individual items in an array value.
export const FormattedFieldValue = ({ value, field }) => {
  const { formatMessage: t } = useIntl()
  // Select multiple answers are an array, so we join them with commas
  const formattedValue = (Array.isArray(value) ? value : [value])
    // Filter any undefined values or empty strings (an empty string can come
    // from a user deleting an answer) TODO: Values that are just spaces
    .filter(value => typeof value !== 'undefined' && value !== '')
    .map(value =>
      t({
        id: `fields.${field.id}.options.${JSON.stringify(value)}`,
        defaultMessage: getValueLabel(value, field)
      }).trim()
    )
    .join(', ')
  // This will return a noAnswer string if formattedValue is undefined or an
  // empty string
  return <>{formattedValue || t(m.noAnswer)}</>
}

// TODO: Better hangling of boolean and null values (we don't create these
// anywhere yet)
function getValueLabel (value, field) {
  if (field.type === 'select_one' || field.type === 'select_multiple') {
    // Look up label from field options. This is not necessary for presets
    // created with mapeo-settings-builder@^3.1.0, which will have these options
    // in the translation file, but is needed for older versions of presets

    // SelectMultiple is just a subtype of SelectOne, so this typecast is fine.
    const selectableField = field

    const options = field.options
      ? convertSelectOptionsToLabeled(selectableField.options)
      : []
    const matchingOption = options.find(option => option.value === value)
    if (matchingOption) return matchingOption.label
  }
  if (value === null) {
    return 'NULL'
  } else if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  } else if (typeof value === 'number') {
    return String(value)
  } else {
    return value
  }
}
