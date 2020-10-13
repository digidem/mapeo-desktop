// @flow
import React from 'react'
import { DatePicker } from '@material-ui/pickers'
import { getDateString } from '../utils/helpers'

type Props = {
  value: Date | void,
  onChange: (string | void) => any,
  placeholder?: string
}

const DateField = ({ value, onChange, placeholder, ...otherProps }: Props) => {
  return (
    <DatePicker
      fullWidth
      variant='inline'
      inputVariant='outlined'
      margin='normal'
      format='dd/MM/yyyy'
      autoOk
      value={
        // DatePicker shows the current date if value is undefined. To show it
        // as empty, value needs to be null
        value === undefined ? null : value
      }
      placeholder={placeholder}
      onChange={date => onChange(getDateString(date))}
      {...otherProps}
      InputLabelProps={{
        shrink: true
      }}
    />
  )
}

export default DateField
