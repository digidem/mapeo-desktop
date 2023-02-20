import React from 'react'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import { defineMessages, FormattedMessage } from 'react-intl'

import { Template } from './Template'

const msgs = defineMessages({
  exportSuccessfulButton: {
    id:
      'renderer.components.MapFilter.DataExportDialog.ExportSuccessful.exportSuccessfulButton',
    defaultMessage: 'OK'
  },
  exportSuccessful: {
    id:
      'renderer.components.MapFilter.DataExportDialog.ExportSuccessful.exportSuccessful',
    defaultMessage: 'Successfully exported observations.'
  }
})

export const ExportSuccessful = ({ onClose }) => (
  <Template
    actions={
      <Button onClick={onClose} color='primary' variant='contained'>
        <FormattedMessage {...msgs.exportSuccessfulButton} />
      </Button>
    }
    content={
      <DialogContentText>
        <FormattedMessage {...msgs.exportSuccessful} />
      </DialogContentText>
    }
  />
)
