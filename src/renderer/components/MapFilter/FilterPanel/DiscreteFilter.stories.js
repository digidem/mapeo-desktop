// @flow
/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react'
import DateFnsUtils from '@date-io/date-fns' // choose your lib
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DiscreteFilter from './DiscreteFilter'
import List from '@material-ui/core/List'

export default {
  title: 'FilterPanel/components/DiscreteFilter',
  decorators: [
    (storyFn: any) => (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <List style={{ width: '100%', maxWidth: 360 }}>{storyFn()}</List>
      </MuiPickersUtilsProvider>
    )
  ]
}

const options = [
  { value: 'foo', label: 'Foo' },
  { value: 'bar', label: 'Bar' },
  { value: 'qux', label: 'Qux' },
  { value: 10, label: 'Ten' },
  { value: '2019-09-30T11:13:49.165Z', label: 'Today' },
  { value: null, label: 'No Value' },
  null,
  true,
  false,
  1,
  'helo;',
  '2019-09-30'
]

export const defaultStory = () => {
  const [filter, setFilter] = React.useState()
  console.log(filter)
  return (
    <DiscreteFilter
      label='Happening'
      options={options}
      fieldKey={['foo']}
      filter={filter}
      onChangeFilter={setFilter}
    />
  )
}

defaultStory.story = {
  name: 'default'
}
