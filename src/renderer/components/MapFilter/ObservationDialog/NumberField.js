import React from 'react'
import { TextField as MuiTextField } from '@material-ui/core'

const TextField = ({ onChange, ...otherProps }) => {
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
      {...otherProps}
    />
  )
}

export default TextField
