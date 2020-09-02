// @flow
import React from 'react'

import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import PrintButton from './PrintButton'

export default {
  title: 'ReportView/components/PrintButton'
}

// TODO: fix this story to include a real PDF url
export const defaultStory = () => (
  <PrintButton
    disabled={false}
    url={'http://url'}
  />
)

defaultStory.story = {
  name: 'default'
}
