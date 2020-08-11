// @flow
import React from 'react'
import { DatePicker } from '@material-ui/pickers'
import { parseDateString, getDateString } from '../utils/helpers'

const DateField = ({ value, onChange, ...otherProps }: any) => {
  const valueAsDate = parseDateString(value)
  return (
    <DatePicker
      fullWidth
      variant='inline'
      inputVariant='outlined'
      margin='normal'
      format='dd/MM/yyyy'
      autoOk
      value={valueAsDate}
      onChange={date => onChange(getDateString(date))}
      {...otherProps}
    />
  )
}

export default DateField
