// @flow
import React from 'react'
import MuiTextField from '@material-ui/core/TextField'

type Props = {
  value: number | void,
  onChange: (number | void) => any
}

const TextField = ({ onChange, value, ...otherProps }: Props) => {
  const handleChange = event =>
    onChange &&
    onChange(
      Number.isNaN(event.target.valueAsNumber)
        ? undefined
        : event.target.valueAsNumber
    )
  return (
    <MuiTextField
      fullWidth
      variant='outlined'
      margin='normal'
      type='number'
      InputLabelProps={{ shrink: true }}
      onChange={handleChange}
      value={value === undefined ? '' : value}
      {...otherProps}
    />
  )
}

export default TextField
