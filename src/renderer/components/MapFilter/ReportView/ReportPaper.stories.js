// @flow
import React from 'react'

import { action } from '@storybook/addon-actions'

import ReportPaper from './ReportPaper'

export default {
  title: 'ReportView/components/ReportPaper'
}

export const empty = () => (
  <ReportPaper paperSize="a4">
    <h1>Hello World</h1>
  </ReportPaper>
)

export const clickable = () => (
  <ReportPaper paperSize="a4" onClick={action('page click')}>
    <h1>Hello World</h1>
  </ReportPaper>
)
