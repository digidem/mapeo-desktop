// @flow
import * as React from 'react'
import Checkbox from './StyledCheckbox'
import ListIcon from '@material-ui/icons/List'
import { makeStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import FilterSection from './FilterSection'
import OnlyButton from './OnlyButton'

import { getField } from '../lib/data_analysis'
import FormattedValue from '../internal/FormattedValue'
import type { Key, Filter, SelectOptions, SelectableFieldValue } from '../types'

// import {FIELD_TYPE_BOOLEAN, FIELD_TYPE_NUMBER} from '../../constants'

const FilterItem = ({ onClick, checked, label, id, onOnlyClick }) => {
  const cx = useStyles()
  return (
    <ListItem
      role={undefined}
      dense
      button
      onClick={onClick}
      className={cx.filterItem}
    >
      <ListItemIcon className={cx.checkboxIcon}>
        <Checkbox
          edge='start'
          checked={checked}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': id }}
          className={cx.checkbox}
        />
      </ListItemIcon>
      <ListItemText id={id} primary={label} />
      <ListItemSecondaryAction>
        <OnlyButton className={cx.onlyButton} onClick={onOnlyClick} />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

type Props = {
  label: React.Node,
  fieldKey: Key,
  filter?: Filter | null,
  options: SelectOptions,
  onChangeFilter: (filter: Array<any> | null) => void
}

const DiscreteFilter = ({
  label,
  fieldKey,
  filter,
  options,
  onChangeFilter
}: Props) => {
  const values: Array<number | string | boolean> = options.reduce(
    (acc, cur) => {
      // Filter null values
      if (cur == null) return acc
      if (typeof cur === 'object' && cur.value != null) acc.push(cur.value)
      else if (typeof cur !== 'object') acc.push(cur)
      return acc
    },
    []
  )
  const shownValues = valuesFromFilter(filter, values)
  const allValues = [...new Set([...shownValues, ...values].sort())]

  const handleClick = value => e => {
    if (shownValues.has(value)) shownValues.delete(value)
    else shownValues.add(value)
    const newFilter =
      // If all items are selected we're implicitly including undefined and null
      // values, so we clear the filter altogether if everything is selected
      shownValues.size === allValues.length
        ? null
        : shownValues.size > 0
        ? ['in', fieldKey, ...shownValues]
        : ['!in', fieldKey, ...allValues]
    onChangeFilter(newFilter)
  }

  const handleOnlyClick = value => () => {
    onChangeFilter(['in', fieldKey, value])
  }

  // Don't render the filter if there is nothing to choose from
  if (!allValues || allValues.length === 0) return null

  return (
    <FilterSection
      title={label}
      icon={<ListIcon />}
      isFiltered={!!filter}
      onShowAllClick={() => onChangeFilter(null)}
    >
      {allValues.map((v, i) => {
        // TODO use FormattedValue here
        const option = options.find(
          o => typeof o === 'object' && o !== null && o.value === v
        )
        const label = option ? (
          // $FlowFixMe - pretty sure the find above means this must have a label prop
          option.label
        ) : v == null ? (
          '[No Value]'
        ) : (
          // This is kind of a hack just to re-use code that detects and formats dates if they are options
          <FormattedValue value={v} field={getField([], v)} />
        )
        const key = JSON.stringify(v)
        return (
          <FilterItem
            key={key}
            id={key}
            label={label}
            checked={shownValues.has(v)}
            onClick={handleClick(v)}
            onOnlyClick={handleOnlyClick(v)}
          />
        )
      })}
    </FilterSection>
  )
}

function valuesFromFilter (filter, values = []): Set<SelectableFieldValue> {
  if (!filter || filter.length < 3) return new Set(values)
  // $FlowFixMe - need to better define type for filter
  if (filter[0] === 'in') return new Set(filter.slice(2))
  if (filter[0] === '!in') {
    const notShown = filter.slice(2)
    const shown = values.filter(v => notShown.indexOf(v) < 0)
    return new Set(shown)
  }
  return new Set(values)
}

export default DiscreteFilter

const useStyles = makeStyles(theme => ({
  filterItem: {
    paddingTop: 0,
    paddingBottom: 0,
    '& $onlyButton': {
      display: 'none'
    },
    '&:hover $onlyButton': {
      display: 'block'
    }
  },
  onlyButton: {
    fontSize: 12,
    lineHeight: '16px',
    minWidth: 'auto'
  },
  checkboxIcon: {
    minWidth: 36,
    paddingLeft: 4
  },
  checkbox: {
    padding: 0,
    paddingLeft: 12,
    '&:hover': {
      backgroundColor: 'inherit !important'
    }
  }
}))
