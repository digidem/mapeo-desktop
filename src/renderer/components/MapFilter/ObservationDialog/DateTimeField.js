import React from 'react'
import { DateTimePicker } from '@material-ui/pickers'

const DateTimeField = ({ value, onChange, ...otherProps }) => {
  return (
    <DateTimePicker
      fullWidth
      variant='inline'
      inputVariant='outlined'
      margin='normal'
      value={
        // DateTimePicker shows the current date if value is undefined. To show
        // it as empty, value needs to be null
        value === undefined ? null : value
      }
      onChange={date =>
        date === undefined ? onChange() : onChange(date.toISOString())
      }
      {...otherProps}
    />
  )
}

export default DateTimeField
