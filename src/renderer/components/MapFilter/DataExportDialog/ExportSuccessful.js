import React from 'react'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import { defineMessages, FormattedMessage } from 'react-intl'

import { Template } from './Template'

const msgs = defineMessages({
  exportSuccessfulButton: 'OK',
  exportSuccessful: 'Successfully exported observations.'
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
