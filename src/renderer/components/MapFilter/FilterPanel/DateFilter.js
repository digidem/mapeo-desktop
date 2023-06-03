import * as React from 'react'
import DateIcon from '@material-ui/icons/DateRange'
import { makeStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'

import { useIntl, defineMessages } from 'react-intl'
import { parseDateString } from '../utils/helpers'

import FilterSection from './FilterSection'
import DateField from '../ObservationDialog/DateField'

const m = defineMessages({
  // Title of min date field in filter
  min: {
    id: 'renderer.components.MapFilter.FilterPanel.DateFilter.min',
    defaultMessage: 'From'
  },
  // Title of max date field in filter
  max: {
    id: 'renderer.components.MapFilter.FilterPanel.DateFilter.max',
    defaultMessage: 'To'
  }
})

const DateFilter = ({
  label,
  fieldKey,
  filter,
  min,
  max,
  type = 'datetime',
  onChangeFilter
}) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  const [filterMin, filterMax] = parseDateFilter(filter)

  const isFiltered =
    (filterMin != null && filterMin > min) ||
    (filterMax != null && filterMax < max)

  const handleChange = minOrMax => value => {
    const filterValue = createFilterValue(value, minOrMax)
    const newFilter =
      minOrMax === 'min'
        ? compileFilter(
            fieldKey,
            filterValue,
            filterMax &&
              (filterMax < filterValue
                ? createFilterValue(value, 'max')
                : filterMax)
          )
        : compileFilter(
            fieldKey,
            filterMin &&
              (filterMin > filterValue
                ? createFilterValue(value, 'min')
                : filterMin),
            filterValue
          )
    onChangeFilter(newFilter)
  }

  return (
    <FilterSection
      title={label}
      icon={<DateIcon />}
      isFiltered={isFiltered}
      onShowAllClick={() => onChangeFilter(null)}
    >
      <ListItem>
        <DateField
          minDate={parseDateString(min)}
          maxDate={parseDateString(max)}
          label={t(m.min)}
          value={filterMin || min}
          onChange={handleChange('min')}
          fullWidth={false}
          margin='dense'
          className={cx.dateField}
        />
        <DateField
          minDate={parseDateString(min)}
          maxDate={parseDateString(max)}
          label={t(m.max)}
          value={filterMax || max}
          onChange={handleChange('max')}
          fullWidth={false}
          margin='dense'
          className={cx.dateField}
        />
      </ListItem>
    </FilterSection>
  )
}

export default DateFilter

function compileFilter (key, min, max) {
  if (min === undefined && max === undefined) return null
  const filter = ['all']
  if (min) filter.push(['>=', key, min])
  if (max) filter.push(['<=', key, max])
  return filter
}

function parseDateFilter (filter) {
  if (!filter || filter.length < 2 || filter[0] !== 'all') return []
  const minFilter = filter.find(d => Array.isArray(d) && d[0] === '>=')
  const maxFilter = filter.find(d => Array.isArray(d) && d[0] === '<=')
  return [minFilter && minFilter[2], maxFilter && maxFilter[2]]
}

const useStyles = makeStyles(theme => ({
  dateField: {
    '&:not(:last-child)': {
      marginRight: theme.spacing(1)
    }
  }
}))

const shortDateRegExp = /^(\d{4})-(\d{2})-(\d{2})$/

function createFilterValue (value, minOrMax) {
  if (!value) return value
  const match = value.match(shortDateRegExp)
  if (!match) return value
  return minOrMax === 'min'
    ? new Date(+match[1], +match[2] - 1, +match[3]).toISOString()
    : new Date(
        +match[1],
        +match[2] - 1,
        +match[3],
        23,
        59,
        59,
        999
      ).toISOString()
}
