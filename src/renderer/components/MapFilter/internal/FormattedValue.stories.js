// @flow
import React from 'react'
import withPropsCombinations from 'react-storybook-addon-props-combinations'

// import { action } from '@storybook/addon-actions'

import FormattedValue from './FormattedValue'
import * as fieldTypes from '../constants/field_types'

export default {
  title: 'internal/FormattedValue'
}

export const textFromString = () => (
  <FormattedValue
    value="hello world"
    field={{ id: '', key: [], type: fieldTypes.TEXT }}
  />
)

textFromString.story = {
  name: 'text from string'
}

export const textFromBool = () => (
  <FormattedValue
    value={true}
    field={{ id: '', key: [], type: fieldTypes.TEXT }}
  />
)

textFromBool.story = {
  name: 'text from bool'
}

export const textFromNumber = () => (
  <FormattedValue
    value={2}
    field={{ id: '', key: [], type: fieldTypes.TEXT }}
  />
)

textFromNumber.story = {
  name: 'text from number'
}

export const textFromNull = () => (
  <FormattedValue
    value={null}
    field={{ id: '', key: [], type: fieldTypes.TEXT }}
  />
)

textFromNull.story = {
  name: 'text from null'
}

export const link = () => (
  <FormattedValue
    value="http://www.example.com"
    field={{ id: '', key: [], type: fieldTypes.LINK }}
  />
)

export const linkButNotLink = () => (
  <FormattedValue
    value="not a link"
    field={{ id: '', key: [], type: fieldTypes.LINK }}
  />
)

linkButNotLink.story = {
  name: 'link but not link'
}

export const linkFromNull = () => (
  <FormattedValue
    value={null}
    field={{ id: '', key: [], type: fieldTypes.LINK }}
  />
)

linkFromNull.story = {
  name: 'link from null'
}

export const date = () => (
  <FormattedValue
    value={+new Date('2018-08-03T13:56:53.928Z')}
    field={{ id: '', key: [], type: fieldTypes.DATE }}
  />
)

export const dateNull = () => (
  <FormattedValue
    value={null}
    field={{ id: '', key: [], type: fieldTypes.DATE }}
  />
)

dateNull.story = {
  name: 'date null'
}

export const datetime = () => (
  <FormattedValue
    value={+new Date('2018-08-03T13:56:53.928Z')}
    field={{ id: '', key: [], type: fieldTypes.DATETIME }}
  />
)

export const datetimeNull = () => (
  <FormattedValue
    value={null}
    field={{ id: '', key: [], type: fieldTypes.DATETIME }}
  />
)

datetimeNull.story = {
  name: 'datetime null'
}

export const number = () => (
  <FormattedValue
    value={2}
    field={{ id: '', key: [], type: fieldTypes.NUMBER }}
  />
)

export const selectOneBoolean = () => (
  <FormattedValue
    value={true}
    field={{ id: '', key: [], type: fieldTypes.SELECT_ONE, options: [] }}
  />
)

selectOneBoolean.story = {
  name: 'select one boolean'
}

export const selectOneString = () => (
  <FormattedValue
    value="hello world"
    field={{ id: '', key: [], type: fieldTypes.SELECT_ONE, options: [] }}
  />
)

selectOneString.story = {
  name: 'select one string'
}

export const selectMultiple = () => (
  <FormattedValue
    value={['foo', true, 2, null]}
    field={{ id: '', key: [], type: fieldTypes.SELECT_MULTIPLE, options: [] }}
  />
)

selectMultiple.story = {
  name: 'select multiple'
}

export const combinations = () =>
  withPropsCombinations(FormattedValue, {
    value: ['hello world', true, false, null],
    fieldkey: ['testFieldkey'],
    fieldType: [fieldTypes.TEXT]
  })()
