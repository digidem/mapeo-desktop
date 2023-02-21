import React from 'react'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

const { shell } = window.electron
import logger from '../../../logger'

import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  openLog: {
    id: 'renderer.components.dialogs.Error.openLog',
    defaultMessage: 'Open log...'
  },
  close: {
    id: 'renderer.components.dialogs.Error.close',
    defaultMessage: 'Close'
  }
})

export default ({ onClose, open, message }) => {
  const { formatMessage: t } = useIntl()

  const handleDownload = event => {
    shell.openPath(logger.errorFilename)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <TextareaAutosize
          rowsMin='5'
          rowsMax='30'
          cols='40'
          value={message}
          disabled
        />
        <DialogActions>
          <Button onClick={handleDownload}>{t(m.openLog)}</Button>
          <Button variant='contained' color='primary' onClick={onClose}>
            {t(m.close)}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
