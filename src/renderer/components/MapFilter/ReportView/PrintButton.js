// @flow
import React from 'react'
import PrintIcon from '@material-ui/icons/Print'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { defineMessages, FormattedMessage } from 'react-intl'

import ToolbarButton from '../internal/ToolbarButton'

import type { PaperSize } from '../types'

const messages = defineMessages({
  // Title of print settings dialog
  dialogTitle: 'Print settings',
  // Label for paper size selection field
  paperSize: 'Paper size',
  // Button label to close print settings dialog
  close: 'Close',
  // Button label to print a report
  print: 'Print'
})

type Props = {
  requestPrint: () => void,
  changePaperSize: (paperSize: PaperSize) => void,
  paperSize: PaperSize
}

type State = {
  dialogOpen: boolean
}

class PrintButton extends React.Component<Props, State> {
  state = {
    dialogOpen: false
  }

  handleKeyDown = (event: SyntheticKeyboardEvent<HTMLElement>) => {
    if (!(event.key === 'p' && event.metaKey)) return
    event.preventDefault()
    window.addEventListener('keyup', this.handleKeyUp)
  }

  handleKeyUp = (event: SyntheticKeyboardEvent<HTMLElement>) => {
    window.removeEventListener('keyup', this.handleKeyUp)
    if (this.state.dialogOpen) {
      this.props.requestPrint()
    } else {
      this.openDialog()
    }
  }

  openDialog = () => this.setState({ dialogOpen: true })

  closeDialog = () => this.setState({ dialogOpen: false })

  handleChangePaperSize = (e: SyntheticInputEvent<HTMLSelectElement>) => {
    // $FlowFixMe - Flow doesn't recognize value being one of options
    const value: PaperSize = e.currentTarget.value
    this.props.changePaperSize(value)
  }

  render () {
    const { requestPrint, paperSize } = this.props
    const { dialogOpen } = this.state
    return (
      <React.Fragment>
        <ToolbarButton onClick={this.openDialog}>
          <PrintIcon />
          <FormattedMessage {...messages.print} />
        </ToolbarButton>
        <Dialog
          open={dialogOpen}
          onClose={this.closeDialog}
          fullWidth
          maxWidth='xs'
          className='d-print-none'
        >
          <DialogTitle>
            <FormattedMessage {...messages.dialogTitle} />
          </DialogTitle>
          <DialogContent>
            <FormControl>
              <InputLabel htmlFor='paper-size'>
                <FormattedMessage {...messages.paperSize} />
              </InputLabel>
              <Select
                native
                value={paperSize}
                onChange={this.handleChangePaperSize}
                input={<Input id='paper-size' />}
              >
                <option value='a4'>A4 (210mm x 297mm)</option>
                <option value='letter'>Letter (8.5&quot; x 11&quot;)</option>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog} color='primary'>
              <FormattedMessage {...messages.close} />
            </Button>
            <Button
              onClick={() => {
                this.closeDialog()
                requestPrint()
              }}
              color='primary'
            >
              <FormattedMessage {...messages.print} />
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default PrintButton
