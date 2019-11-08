/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { StylesProvider } from '@material-ui/styles'
import { action } from '@storybook/addon-actions'

import DataExportDialog from './DataExportDialog'
import exampleObservations from '../../../../fixtures/observations.json'

export default {
  title: 'MapFilter/components/DataExportDialog',
  decorator: [
    storyFn => <StylesProvider injectFirst>{storyFn()}</StylesProvider>
  ]
}

export const defaultStory = () => {
  return (
    <DataExportDialog
      open
      onClose={action('close')}
      onSave={action('save')}
      observations={exampleObservations}
    />
  )
}

defaultStory.story = {
  name: 'default'
}

export const noData = () => {
  return (
    <DataExportDialog open onClose={action('close')} onSave={action('save')} />
  )
}
