// @flow
import React, { useMemo } from 'react'
import PrintIcon from '@material-ui/icons/Print'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { BlobProvider } from '@react-pdf/renderer'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import type { Observation } from 'mapeo-schema'

import Loading from '../../Loading'
import PDFReport from './PDFReport'
import type { ReportProps } from './PDFReport'

import ToolbarButton from '../internal/ToolbarButton'

const LARGE_REPORT_LENGTH = 50

const messages = defineMessages({
  // Title of print settings dialog
  dialogTitle: 'Saving Report',
  // Title of the PDF document
  title: 'Title',
  // Button label to close print settings dialog
  close: 'Cancel',
  // Button label to save a report
  print: 'Save',
  // Loading message when report is very long.
  printLoading:
    'Note: This report is more than 50 pages long. It may take several minutes to prepare.',
  // The title of the report on the filesystem
  reportName: 'Report'
})

type Props = {
  renderer: PDFReportOptions,
  observations: Array<Observation>,
  disabled: boolean
}

type State = {
  dialogOpen: boolean
}

class PrintButton extends React.Component<Props, State> {
  state = {
    dialogOpen: false
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
          {dialogOpen ? (
            <SavePDFLoadingDialog
              closeDialog={this.closeDialog}
              renderer={renderer}
              observations={observations}
            />
          ) : null}
        </Dialog>
      </React.Fragment>
    )
  }
}

// SavePDFLoadingDialog shows a loading screen while the PDF is saving,
// and then opens the save dialog for the PDF once complete.
//
// This begins creating the PDF document as soon as the dialog is loaded
// and then waits for it to be ready before downloading the PDF
//
// For now, there are no options or configurations to complete before the PDF
// starts rendering.
//
// In the future, we may want to give the user some options for formatting
// the report. In that case, we would want to have a page before this one
// that allows the user to set those parameters.
//
// Those parameters can be sent through the 'renderer' object,
// which is passed to PDFReport to actually create the PDF.

const SavePDFLoadingDialog = ({ closeDialog, renderer, observations }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  const pdf = useMemo(() => {
    return <PDFReport observations={observations} renderer={renderer} />
  }, [renderer, observations])

  const finishedLoading = url => {
    const link = document.createElement('a')
    const now = new Date()
    const offsetMs = now.getTimezoneOffset() * 60 * 1000
    const dateLocal = new Date(now.getTime() - offsetMs)
    const str = dateLocal
      .toISOString()
      .slice(0, 19)
      .replace(/-/g, '/')
      .replace('T', '-')

    link.setAttribute('download', `${t(messages.reportName)}-${str}.pdf`)
    link.href = url
    // $FlowFixMe - these are always non-null
    document.body.appendChild(link)
    link.click()
    // $FlowFixMe - these are always non-null
    document.body.removeChild(link)
    closeDialog()
  }

  return (
    <BlobProvider document={pdf}>
      {({ blob, url, loading, error }) => {
        if (!loading && !error) finishedLoading(url)
        return (
          <>
            <DialogTitle>
              <FormattedMessage {...messages.dialogTitle} />
            </DialogTitle>
            <DialogContent>
              {loading ? (
                <div className={cx.loadingBox}>
                  <Loading />
                  {observations.length > LARGE_REPORT_LENGTH ? (
                    <div className={cx.loadingMessage}>
                      <FormattedMessage {...messages.printLoading} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color='primary'>
                <FormattedMessage {...messages.close} />
              </Button>
            </DialogActions>
          </>
        )
      }}
    </BlobProvider>
  )
}

export default PrintButton

const useStyles = makeStyles(theme => ({
  loadingBox: {
    padding: '50px'
  },
  loadingMessage: {
    paddingTop: '30px',
    fontStyle: 'italic'
  }
}))
