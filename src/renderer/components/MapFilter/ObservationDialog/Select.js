// @flow
import * as React from 'react'
import TextField from './TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'

import { primitiveToString } from '../utils/strings'
import type {
  SelectableFieldValue,
  LabeledSelectOption,
  SelectOptions
} from '../types'

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

function renderInput (inputProps) {
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

type SelectOneProps = {
  id?: string,
  label: string | React.Element<any>,
  value: SelectableFieldValue,
  placeholder?: string,
  onChange: (value: SelectableFieldValue | void) => any,
  options: SelectOptions
}

type SelectMultipleProps = {
  ...$Exact<SelectOneProps>,
  value: Array<SelectableFieldValue>
}

function Encoder (options: Array<LabeledSelectOption>) {
  return {
    toValue: (label: string | null): SelectableFieldValue | void => {
      if (label === null) return
      var opts = options.find(ops => ops.label === label)
      return opts && typeof opts.value !== 'undefined' ? opts.value : label
    },
    toLabel: (value: SelectableFieldValue): string => {
      var opts = options.find(ops => ops.value === value)
      return (opts && opts.label) || primitiveToString(value)
    }
  }
}

function isSelectableFieldValue (
  v: SelectableFieldValue | LabeledSelectOption
): boolean {
  return (
    typeof v === 'string' ||
    typeof v === 'boolean' ||
    typeof v === 'number' ||
    v === null
  )
}

function getLabeledSelectOptions (
  options: SelectOptions
): Array<LabeledSelectOption> {
  return options.map(opt =>
    isSelectableFieldValue(opt)
      ? // $FlowFixMe
        { label: primitiveToString(opt), value: opt }
      : // $FlowFixMe
        opt
  )
}

/**
 * A multi-select field that allows the user to enter a value that is not on the
 * list. Allows the selection of non-string values from a list, but the labels
 * for each item must be unique for this to work reliably
 */
export const SelectOne = ({
  id,
  value,
  label,
  options,
  placeholder,
  onChange,
  ...props
}: SelectOneProps) => {
  const classes = useStyles()
  const labeledOptions = getLabeledSelectOptions(options)
  const encoder = Encoder(labeledOptions)

  return (
    <Autocomplete
      id={id}
      value={encoder.toLabel(value)}
      onChange={(e, v: string) => onChange(encoder.toValue(v))}
      options={labeledOptions.map(opt => opt.label)}
      renderInput={params =>
        renderInput({ ...params, classes, label, placeholder })
      }
      {...props}
    />
  )
}

export const SelectMultiple = ({
  id,
  value,
  label,
  options,
  placeholder,
  onChange,
  ...props
}: SelectMultipleProps) => {
  const classes = useStyles()
  const labeledOptions = getLabeledSelectOptions(options)
  const encoder = Encoder(labeledOptions)
  let arrayValue = []
  if (value === undefined) arrayValue = []
  else if (!Array.isArray(value)) arrayValue = [value]
  else arrayValue = value

  return (
    <Autocomplete
      id={id}
      multiple
      freeSolo
      value={arrayValue.map(encoder.toLabel)}
      onChange={(e, v) => onChange(v.map(encoder.toValue))}
      options={labeledOptions.map(opt => opt.label)}
      renderInput={params =>
        renderInput({ ...params, classes, label, placeholder })
      }
      {...props}
    />
  )
}
