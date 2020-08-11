import React from 'react'
import MuiTextField from '@material-ui/core/TextField'

const TextField = ({ onChange, ...otherProps }) => {
  const handleChange = event => onChange && onChange(event.target.value)
  return (
    <MuiTextField
      fullWidth
      variant='outlined'
      margin='normal'
      InputLabelProps={{ shrink: true }}
      onChange={handleChange}
      {...otherProps}
    />
  )
}

export default TextField
