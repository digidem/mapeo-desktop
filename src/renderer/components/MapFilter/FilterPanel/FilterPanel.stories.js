// @flow
/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react'
import FilterPanel from './FilterPanel'
import type { Preset } from 'mapeo-schema'
import type { Field } from '../types'
import fixtureObs from '../../fixtures/observations.json'

export default {
  title: 'FilterPanel',
  decorators: [
    (storyFn: any) => (
      <div style={{ maxWidth: 400, height: '100vh', display: 'flex' }}>
        {storyFn()}
      </div>
    )
  ]
}

export const minimal = () => {
  const [filter, setFilter] = React.useState(null)
  console.log(filter)
  return <FilterPanel filter={filter} onChangeFilter={setFilter} />
}

const presets: Preset[] = [
  {
    name: 'Mining',
    id: 'mining',
    geometry: ['point'],
    tags: {}
  },
  {
    name: 'Logging',
    id: 'logging',
    geometry: ['point'],
    tags: {}
  },
  {
    name: 'Oil Spill',
    id: 'oil',
    geometry: ['point'],
    tags: {}
  }
]

export const withPresets = () => {
  const [filter, setFilter] = React.useState(null)
  return (
    <FilterPanel filter={filter} onChangeFilter={setFilter} presets={presets} />
  )
}

export const withObservations = () => {
  const [filter, setFilter] = React.useState(null)
  console.log(filter)
  return (
    <FilterPanel
      filter={filter}
      observations={fixtureObs}
      onChangeFilter={setFilter}
      presets={presets}
    />
  )
}

const fields: Field[] = [
  {
    type: 'select_one',
    id: 'myfield',
    label: 'My Special Field',
    key: ['myField'],
    options: ['foo', { label: 'Custom label', value: 'bar' }, 'qux']
  }
]

export const withFields = () => {
  const [filter, setFilter] = React.useState(null)
  console.log(filter)
  return (
    <FilterPanel
      filter={filter}
      observations={fixtureObs}
      onChangeFilter={setFilter}
      presets={presets}
      fields={fields}
    />
  )
}
