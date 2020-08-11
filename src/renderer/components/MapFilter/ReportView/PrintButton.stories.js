// @flow
import React, { useState } from 'react'

import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import PrintButton from './PrintButton'

export default {
  title: 'ReportView/components/PrintButton'
}

export const defaultStory = () => (
  <PrintButton
    paperSize="a4"
    changePaperSize={action('paper')}
    requestPrint={action('print')}
  />
)

defaultStory.story = {
  name: 'default'
}
