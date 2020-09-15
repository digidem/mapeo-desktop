// @flow
import React, { useMemo } from 'react'
import PrintIcon from '@material-ui/icons/Print'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Loading from '../../Loading'
import DialogTitle from '@material-ui/core/DialogTitle'
import PDFReport from './PDFReport'
import { BlobProvider } from '@react-pdf/renderer'
import { defineMessages, FormattedMessage } from 'react-intl'

import ToolbarButton from '../internal/ToolbarButton'

import type { PaperSize } from '../types'

const messages = defineMessages({
  // Title of print settings dialog
  dialogTitle: 'Print PDF',
  // Title of the PDF document
  title: 'Title',
  // Button label to close print settings dialog
  close: 'Close',
  // Button label to print a report
  print: 'Print'
})

type Props = {
  requestPrint: () => void,
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

  render () {
    const { disabled, renderer, observations } = this.props
    const { dialogOpen } = this.state
    return (
      <React.Fragment>
        <ToolbarButton onClick={this.openDialog} disabled={disabled}>
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
        { dialogOpen
          ? <PrintDialogBody
              closeDialog={this.closeDialog}
              renderer={renderer}
              observations={observations}
            />
          : null
        }
        </Dialog>
      </React.Fragment>
    )
  }
}


const PrintDialogBody = ({ closeDialog, renderer, observations }) => {
  const pdf = useMemo(() => {
    return (
      <PDFReport
        observations={observations}
        renderer={renderer}
      />
    )
  }, [
    renderer,
    observations
  ])

   return <BlobProvider document={pdf}>
      {({ blob, url, loading, error }) => (
      <>
        <DialogTitle>
          <FormattedMessage {...messages.dialogTitle} />
        </DialogTitle>
        <DialogContent>
        { loading ? <Loading /> : null }
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color='primary'>
            <FormattedMessage {...messages.close} />
          </Button>
          <Button
            component='a'
            disabled={error || loading}
            href={url}
            color='primary'
            download='report.pdf'
          >
            <FormattedMessage {...messages.print} />
          </Button>
        </DialogActions>
      </>
    )}
  </BlobProvider>
}



export default PrintButton
