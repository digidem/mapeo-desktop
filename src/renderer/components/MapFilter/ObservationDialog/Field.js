// @flow
import React from 'react'
import { useIntl } from 'react-intl'
import { SelectOne, SelectMultiple } from './Select'
import TextField from './TextField'
import NumberField from './NumberField'
import DateField from './DateField'
import DateTimeField from './DateTimeField'

import { getLocalizedFieldProp } from '../utils/strings'
import FormattedFieldname from '../internal/FormattedFieldname'
import { type Field as FieldType, type Key } from '../types'

type Props = {
  field: FieldType,
  value: any,
  onChange: (Key, any) => void
}

const Field = ({ field, value, onChange }: Props) => {
  const { locale } = useIntl()
  const label = <FormattedFieldname field={field} />
  const placeholder: string = getLocalizedFieldProp(
    field,
    'placeholder',
    locale
  )
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
    case 'text':
      // In mapeo-schema, text fields default to multiline appearance.
      const isMultiline = field.appearance !== 'singleline'
      return (
        <TextField
          value={value}
          multiline={isMultiline}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'select_one':
      return (
        <SelectOne
          value={value}
          options={field.options}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'select_multiple':
      return (
        <SelectMultiple
          value={value}
          label={label}
          options={field.options}
          placeholder={placeholder}
          onChange={handleChange}
        />
      )
    case 'number':
      return (
        <NumberField
          value={value}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'date':
      return (
        <DateField
          value={value}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    case 'datetime':
      return (
        <DateTimeField
          value={value}
          onChange={handleChange}
          label={label}
          placeholder={placeholder}
        />
      )
    default:
      return (
        <TextField
          value={value}
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
