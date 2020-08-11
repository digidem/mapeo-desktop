// @flow
import React, { useMemo, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import { defineMessages, useIntl } from 'react-intl'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import DateFnsUtils from '@date-io/date-fns' // choose your lib
import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import { createMemoizedStats } from '../lib/data_analysis/index'
import DiscreteFilter from './DiscreteFilter'
import DateFilter from './DateFilter'
import getStats from '../stats'
import FormattedFieldname from '../internal/FormattedFieldname'

import type {
  Statistics,
  Filter,
  Field,
  SelectOptions,
  FieldStatistic
} from '../types'
import type { Observation, Preset } from 'mapeo-schema'

type Props = {
  filter: Filter | null,
  onChangeFilter: (filter: Filter | null) => void,
  observations?: Observation[],
  fields?: Field[],
  presets?: Preset[]
}

const m = defineMessages({
  // Button text to change which fields are shown and filterable in the filter pane
  editFilters: 'Edit Filters…',
  // Label for filter by date observation was created
  created: 'Date of observation',
  // Label for filter by date observation was modified (e.g. edited by a user)
  modified: 'Modified',
  // Label for filter by category (e.g. the preset)
  preset: 'Category'
})

const memoizedStats = createMemoizedStats()
// Stats just for the created and modified fields. The other stat instance we
// use is for memoized stats of observation tags which does not include these
// top-level props
const getTimestampStats = (observations: Observation[]): Statistics => {
  return memoizedStats(
    observations.map(o => ({
      $created: o.created_at,
      $modified: o.timestamp
    }))
  )
}

const FilterPanel = ({
  filter,
  onChangeFilter,
  observations = [],
  fields = [],
  presets = []
}: Props) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  let filterByField: { [fieldId: string]: Filter | null } = {}
  let filterError

  try {
    filterByField = parseFilter(filter)
  } catch (e) {
    console.log(filter)
    console.warn(e)
    filterError = false
  }

  const timestampStats = useMemo(() => getTimestampStats(observations), [
    observations
  ])
  const stats = useMemo(() => getStats(observations), [observations])

  const handleChangeFilter = fieldId => filter => {
    const newFilterByField =
      filter == null
        ? omit(filterByField, fieldId)
        : {
            ...filterByField,
            [fieldId]: filter
          }
    const newFilter = compileFilter(newFilterByField)
    onChangeFilter(newFilter)
  }

  // Filters are shown for: date the observation was created, date modified
  // (edited), the category (preset), and any fields defined in the preset which
  // are select_one, date or date_time. Currently we don't show presets for
  // free-form text fields (which could have too many values, or too many ways
  // of spelling things to makes sense).
  const filterFields = useMemo(() => {
    const $createdId = JSON.stringify(['$created'])
    const $presetId = JSON.stringify(['$preset'])

    const filterFields: { [fieldId: string]: Field } = {
      [$createdId]: {
        id: $createdId,
        key: ['$created'],
        label: t(m.created),
        type: 'datetime',
        min_value:
          timestampStats[$createdId] && timestampStats[$createdId].datetime.min,
        max_value:
          timestampStats[$createdId] && timestampStats[$createdId].datetime.max
      }
    }

    const presetOptions = presets
      // .filter(
      //   preset =>
      //     stats['categoryId'] &&
      //     stats['categoryId'].string.values.has(preset.id)
      // )
      .sort(presetCompare)
      .map(preset => ({
        value: preset.id,
        label: preset.name
      }))

    filterFields[$presetId] = {
      id: $presetId,
      key: ['$preset'],
      label: t(m.preset),
      type: 'select_one',
      options: presetOptions
    }

    // Enable filtering by any select_one, date or date_time field that is
    // defined in the preset, but add in options (for select_one) and min/max
    // (for dates) from the actual data, since the data could include values
    // outside the range defined in the preset
    fields.forEach(field => {
      const fieldId = JSON.stringify(field.key)
      const fieldStats = stats[fieldId]
      if (field.type === 'select_one') {
        // $FlowFixMe
        filterFields[fieldId] = {
          ...field,
          options: combineOptionsWithStats(field.options, fieldStats)
        }
      } else if (field.type === 'date' || field.type === 'datetime') {
        // $FlowFixMe
        filterFields[fieldId] = {
          ...field,
          min_value: fieldStats && fieldStats[field.type].min,
          max_value: fieldStats && fieldStats[field.type].max
        }
      }
    })

    return filterFields
  }, [t, timestampStats, presets, fields, stats])

  useEffect(() => {
    if (!filterError) return
    onChangeFilter(null)
  }, [filterError, onChangeFilter])

  if (filterError) return null

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <List className={cx.list}>
        {Object.keys(filterFields)
          .map(id => {
            const field = filterFields[id]
            if (!field) return
            const fieldId = JSON.stringify(field.key)
            switch (field.type) {
              case 'select_one':
                return (
                  <DiscreteFilter
                    key={field.id}
                    fieldKey={field.key}
                    label={<FormattedFieldname field={field} />}
                    filter={filterByField[fieldId]}
                    options={field.options}
                    onChangeFilter={handleChangeFilter(fieldId)}
                  />
                )
              case 'date':
              case 'datetime':
                return (
                  <DateFilter
                    key={field.id}
                    fieldKey={field.key}
                    label={<FormattedFieldname field={field} />}
                    filter={filterByField[fieldId]}
                    min={field.min_value || '2001-01-01'}
                    max={field.max_value || new Date().toISOString()}
                    onChangeFilter={handleChangeFilter(fieldId)}
                  />
                )
            }
          })
          .filter(Boolean)}
      </List>
    </MuiPickersUtilsProvider>
  )
}

export default FilterPanel

const comparisonOps = ['<=', '>=']
const membershipOps = ['in', '!in']

// Parse a filter and return filter expressions by field id
function parseFilter (
  filter: Filter | null
): { [fieldId: string]: Filter | null } {
  const filterByField = {}
  if (filter == null) return filterByField
  if (!isValidFilter(filter)) throw new Error('Unsupported filter expression')
  filter.slice(1).forEach(subFilter => {
    if (!Array.isArray(subFilter)) return
    if (subFilter[0] === 'all') {
      const fieldId = JSON.stringify(subFilter[1][1])
      filterByField[fieldId] = subFilter
    } else {
      const fieldId = JSON.stringify(subFilter[1])
      filterByField[fieldId] = subFilter
    }
  })
  return filterByField
}

function compileFilter (filterByField: {
  [fieldId: string]: Filter
}): Filter | null {
  const filter = ['all']
  Object.keys(filterByField).forEach(fieldId =>
    filter.push(filterByField[fieldId])
  )
  if (filter.length === 1) return null
  // $FlowFixMe
  return filter
}

// Currently we only support a very specific filter structure
function isValidFilter (filter): boolean {
  if (!Array.isArray(filter)) return false
  if (filter[0] !== 'all') return false
  return filter.slice(1).every(subFilter => {
    if (!Array.isArray(subFilter)) return false
    if (subFilter[0] === 'all') {
      if (subFilter.length < 2) return false
      let key
      return subFilter.slice(1).every(subFilter => {
        if (!Array.isArray(subFilter)) return false
        if (!comparisonOps.includes(subFilter[0])) return false
        if (subFilter.length !== 3) return false
        if (key && !isEqual(key, subFilter[1])) return false
        key = subFilter[1]
        return true
      })
    }
    if (!membershipOps.includes(subFilter[0])) return false
    if (subFilter.length < 3) return false
    return true
  })
}

// Takes a list of options for a select_one field defined in a preset, and adds
// in any values that exist in the data that are not already listed in the field
// definition. Mapeo Desktop (currently) allows you to add new option to a
// select_one field which aren't defined in the preset, and this allows you to
// filter by these new values
function combineOptionsWithStats (
  fieldOptions: SelectOptions,
  fieldStats: FieldStatistic
): SelectOptions {
  if (!fieldStats) return fieldOptions
  const optionsWithStats = [...fieldOptions]
  Object.keys(fieldStats).forEach(valueType => {
    if (!fieldStats[valueType] || !fieldStats[valueType].values) return
    const values = fieldStats[valueType].values
    if (!(values instanceof Map)) return
    for (const value of values.keys()) {
      if (
        optionsWithStats.find(
          o =>
            o === value ||
            (typeof o === 'object' && o !== null && o.value === value)
        )
      )
        continue
      optionsWithStats.push(value)
    }
  })
  return optionsWithStats
}

const useStyles = makeStyles(theme => ({
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'scroll'
  },
  settingsItem: {
    paddingTop: 8,
    paddingBottom: 8
  },
  listIcon: {
    minWidth: 40
  }
}))

// Sort presets by sort property and then by name, then filter only point presets
function presetCompare (a, b) {
  if (typeof a.sort !== 'undefined' && typeof b.sort !== 'undefined') {
    // If sort value is the same, then sort by name
    if (a.sort === b.sort) return compareStrings(a.name, b.name)
    // Lower sort numbers come before higher numbers
    else return a.sort - b.sort
  } else if (typeof a.sort !== 'undefined') {
    // If a has a sort field but b doesn't, a comes first
    return -1
  } else if (typeof b.sort !== 'undefined') {
    // if b has a sort field but a doesn't, b comes first
    return 1
  } else {
    // if neither have sort defined, compare by name
    return compareStrings(a.name, b.name)
  }
}

function compareStrings (a = '', b = '') {
  return a.toLowerCase().localeCompare(b.toLowerCase())
}
