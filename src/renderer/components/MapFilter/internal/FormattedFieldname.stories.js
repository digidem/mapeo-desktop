// @flow
import React from 'react'

// import { action } from '@storybook/addon-actions'

import FormattedFieldname from './FormattedFieldname'

export default {
  title: 'internal/FormattedFieldname'
}

export const plainText = () => (
  <FormattedFieldname field={{ id: '1', type: 'text', key: 'foo' }} />
)

plainText.story = {
  name: 'Plain text'
}

export const nestedFieldname = () => {
  const key = ['foo', 'bar', 'qux']
  return <FormattedFieldname field={{ id: '1', type: 'text', key: key }} />
}

nestedFieldname.story = {
  name: 'Nested fieldname'
}

export const underscoresAndDashesToSpaces = () => {
  const key = ['foo_bob', 'bar', 'qux-hub']
  return <FormattedFieldname field={{ id: '1', type: 'text', key: key }} />
}

underscoresAndDashesToSpaces.story = {
  name: 'Underscores and dashes to spaces'
}

export const withLabel = () => {
  const key = ['foo_bob', 'bar', 'qux_hub']
  return (
    <FormattedFieldname
      field={{ id: '1', type: 'text', key: key, label: 'A Field Label' }}
    />
  )
}

withLabel.story = {
  name: 'With label'
}

export const translatedLabel = () => {
  const key = ['foo', 'bar']
  return (
    <FormattedFieldname
      field={{
        id: '1',
        type: 'text',
        key: key,
        label: 'English label',
        'label:es-PE': 'Peruvian-Spanish label',
        'label:es': 'Etiqueta Español'
      }}
    />
  )
}

translatedLabel.story = {
  name: 'Translated label'
}
