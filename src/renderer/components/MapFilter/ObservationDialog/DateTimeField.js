import React from 'react'
import { DateTimePicker } from '@material-ui/pickers'

const DateField = ({ value, onChange, ...otherProps }) => {
  return (
    <DateTimePicker
      fullWidth
      variant='inline'
      inputVariant='outlined'
      margin='normal'
      value={value}
      onChange={date =>
        date === undefined ? onChange() : onChange(date.toISOString())
      }
      {...otherProps}
    />
  )
}

export default DateField
