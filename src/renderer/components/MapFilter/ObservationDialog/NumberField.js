//
import React from 'react'
import MuiTextField from '@material-ui/core/TextField'

const TextField = ({ onChange, value, ...otherProps }) => {
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
