// @flow
import React from 'react'
import { action } from '@storybook/addon-actions'

import FilterSection from './FilterSection'
import List from '@material-ui/core/List'
import DateIcon from '@material-ui/icons/DateRange'

export default {
  title: 'FilterPanel/components/FilterSection',
  decorators: [
    (storyFn: any) => (
      <List style={{ width: '100%', maxWidth: 360 }}>{storyFn()}</List>
    )
  ]
}

export const defaultStory = () => (
  <FilterSection
    icon={<DateIcon />}
    title="Start Date but a really long titles that expands beyond end"
    isFiltered={false}
    onShowAllClick={action('showAll')}>
    <List>Hello World</List>
  </FilterSection>
)

defaultStory.story = {
  name: 'default'
}

export const filtered = () => (
  <FilterSection
    icon={<DateIcon />}
    title="Start Date"
    isFiltered
    onShowAllClick={action('showAll')}>
    <List>Hello World</List>
  </FilterSection>
)
