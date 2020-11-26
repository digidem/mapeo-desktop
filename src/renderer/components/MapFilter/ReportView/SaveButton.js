// @flow
import React from 'react'
import SaveIcon from '@material-ui/icons/SaveAlt'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { defineMessages, FormattedMessage } from 'react-intl'

import ToolbarButton from '../internal/ToolbarButton'

const messages = defineMessages({
  // Title of print settings dialog
  dialogTitle: 'Warning: Large Report',
  // Button label for Save PDF Button
  buttonLabel: 'Save PDF',
  // Button label to cancel saving report
  cancel: 'Cancel',
  // Button label to confirm saving report
  confirm: 'Continue',
  // Loading message when report is very long.
  dialogContent:
    'This report contains {observationCount} observations, and could take a few minutes to create. Are you sure you want to continue?'
})

type Props = {
  shouldConfirm?: boolean,
  onClick: () => any,
  observationCount: number,
  disabled?: boolean
}

const SaveButton = ({
  shouldConfirm,
  onClick,
  observationCount,
  disabled
}: Props) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)

  function handleConfirmClick () {
    setConfirmDialogOpen(false)
    onClick()
  }

  return (
    <>
      <ToolbarButton
        onClick={() => (shouldConfirm ? setConfirmDialogOpen(true) : onClick())}
        disabled={disabled}
      >
        <SaveIcon />
        <FormattedMessage {...messages.buttonLabel} />
      </ToolbarButton>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        fullWidth
        maxWidth='sm'
        className='d-print-none'
      >
        <DialogTitle>
          <FormattedMessage {...messages.dialogTitle} />
        </DialogTitle>
        <DialogContent>
          <FormattedMessage
            {...messages.dialogContent}
            values={{ observationCount }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color='secondary'>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button onClick={handleConfirmClick} color='primary'>
            <FormattedMessage {...messages.confirm} />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SaveButton
