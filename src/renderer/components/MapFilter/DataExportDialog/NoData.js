import React from 'react'
import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import { defineMessages, FormattedMessage } from 'react-intl'

import { Template } from './Template'

const msgs = defineMessages({
  close: {
    id: 'renderer.components.MapFilter.DataExportDialog.NoData.close',
    defaultMessage: 'Close'
  },
  noData: {
    id: 'renderer.components.MapFilter.DataExportDialog.NoData.noData',
    defaultMessage: "You don't yet have any data to export."
  }
})

export const NoData = ({ onClose }) => (
  <Template
    actions={
      <Button onClick={onClose} color='primary' variant='contained'>
        <FormattedMessage {...msgs.close} />
      </Button>
    }
    content={
      <DialogContentText>
        <FormattedMessage {...msgs.noData} />
      </DialogContentText>
    }
  />
)
