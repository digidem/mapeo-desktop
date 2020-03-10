// @flow
import React, { useRef, useMemo } from 'react'
import Downshift from 'downshift'
import TextField from './TextField'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import matchSorter from 'match-sorter'
import { useIntl, defineMessages } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles'

import type { SelectableFieldValue, SelectOptions } from '../types'

const m = defineMessages({
  yes: 'Yes',
  no: 'No'
})

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  container: {
    width: '100%'
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
  divider: {
    height: theme.spacing(2)
  }
}))

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput
        },
        ...InputProps
      }}
      {...other}
    />
  )
}

type Suggestion = {|
  label: string,
  value: SelectableFieldValue
|}

type RenderSuggestionProps = {|
  highlightedIndex: number | null,
  index: number,
  itemProps: any,
  selectedItem: string,
  suggestion: Suggestion
|}

function renderSuggestion(suggestionProps: RenderSuggestionProps) {
  const {
    suggestion,
    index,
    itemProps,
    highlightedIndex,
    selectedItem
  } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
        textOverflow: 'ellipsis'
      }}>
      {suggestion.label}
    </MenuItem>
  )
}

function getSuggestions(
  value: string,
  suggestions: Array<Suggestion>
): Array<Suggestion> {
  if (value.length === 0) return suggestions
  const matched = matchSorter(suggestions, value, {
    keys: [
      item => item.label,
      item => (typeof item.value === 'string' ? item.value : undefined)
    ]
  })
  if (matched && matched.length === 1 && matched[0].value === value) return []
  return matched
}

type Props = {
  value: SelectableFieldValue,
  placeholder?: string,
  onChange: (value: SelectableFieldValue) => any,
  options: SelectOptions
}

/**
 * A multi-select field that allows the user to enter a value that is not on the
 * list. Allows the selection of non-string values from a list, but the labels
 * for each item must be unique for this to work reliably
 */
export const SelectOne = ({
  value,
  placeholder,
  onChange,
  options,
  ...otherProps
}: Props) => {
  const popperNode = useRef()
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  const suggestions: Array<Suggestion> = useMemo(
    () =>
      options
        .map(opt => {
          if (opt === true) return { value: true, label: t(m.yes) }
          if (opt === false) return { value: false, label: t(m.no) }
          if (typeof opt === 'number') return { value: opt, label: opt + '' }
          if (typeof opt === 'string') return { value: opt, label: opt }
          // TODO: not sure how to handle this - this is "no answer" I think?
          if (opt === null) return { value: null, label: '' }
          return opt
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [options, t]
  )

  const matchingSuggestion = suggestions.find(item =>
    lowerCaseEqual(item.value, value)
  )
  const displayValue = matchingSuggestion ? matchingSuggestion.label : value

  function onStateChange(changes) {
    let newValue
    if (Object.prototype.hasOwnProperty.call(changes, 'selectedItem')) {
      newValue = changes.selectedItem
    } else if (Object.prototype.hasOwnProperty.call(changes, 'inputValue')) {
      newValue = changes.inputValue
    } else {
      return
    }
    const matchingSuggestion = suggestions.find(item =>
      lowerCaseEqual(item.label === newValue)
    )
    newValue = newValue === undefined ? null : newValue
    onChange(matchingSuggestion ? matchingSuggestion.value : newValue)
  }

  return (
    <Downshift
      id="downshift-popper"
      selectedItem={typeof displayValue === 'string' ? displayValue : ''}
      onStateChange={onStateChange}>
      {({
        clearSelection,
        // $FlowFixMe
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        // $FlowFixMe
        highlightedIndex,
        // $FlowFixMe
        inputValue,
        isOpen,
        openMenu,
        // $FlowFixMe
        selectedItem
      }) => {
        const { onBlur, onFocus, ...inputProps } = getInputProps({
          onChange: event => {
            if (event.target.value === '') {
              clearSelection()
            }
          },
          onFocus: openMenu,
          placeholder: placeholder
        })

        return (
          <div className={classes.container}>
            {renderInput({
              fullWidth: true,
              classes,
              InputProps: { onBlur, onFocus },
              InputLabelProps: getLabelProps({ shrink: true }),
              inputProps,
              ref: node => {
                popperNode.current = node
              },
              ...otherProps
            })}

            <Popper
              open={isOpen}
              anchorEl={popperNode.current}
              style={{ zIndex: 9999 }}>
              <div
                {...(isOpen
                  ? getMenuProps({}, { suppressRefError: true })
                  : {})}>
                <Paper
                  square
                  style={{
                    // TODO: When the popover is rendered above the input, when
                    // the list is less than 400px, the bottom is no longer
                    // aligned with the input field
                    marginTop: 8,
                    width: popperNode.current
                      ? popperNode.current.clientWidth
                      : undefined,
                    maxHeight: 400,
                    overflow: 'scroll'
                  }}>
                  {getSuggestions(inputValue, suggestions).map(
                    (suggestion, index) =>
                      renderSuggestion({
                        suggestion,
                        index,
                        itemProps: getItemProps({ item: suggestion.label }),
                        highlightedIndex,
                        selectedItem
                      })
                  )}
                </Paper>
              </div>
            </Popper>
          </div>
        )
      }}
    </Downshift>
  )
}

export const SelectMultiple = ({ value, label }: Props) => {
  return (
    <TextField
      value={Array.isArray(value) ? value.join(', ') : value}
      label={label}
      disabled
    />
  )
}

// for two values, if strings, compare lower case, otherwise strict equal
function lowerCaseEqual(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase() === b.toLowerCase()
  } else {
    return a === b
  }
}
