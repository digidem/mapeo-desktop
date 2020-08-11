// @flow
/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react'
import DateFnsUtils from '@date-io/date-fns' // choose your lib
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFilter from './DateFilter'
import List from '@material-ui/core/List'

export default {
  title: 'FilterPanel/components/DateFilter',
  decorators: [
    (storyFn: any) => (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <List style={{ width: '100%', maxWidth: 360 }}>{storyFn()}</List>
      </MuiPickersUtilsProvider>
    )
  ]
}

export const defaultStory = () => {
  const [filter, setFilter] = React.useState()
  console.log(filter)
  return (
    <DateFilter
      label='Select Date'
      fieldKey={['foo']}
      filter={filter}
      min='2019-01-01T18:40:48.749Z'
      max='2019-09-28T08:40:48.749Z'
      onChangeFilter={setFilter}
    />
  )
}

defaultStory.story = {
  name: 'default'
}
