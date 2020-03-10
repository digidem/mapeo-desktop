// @flow
import React from 'react'
import PrintIcon from '@material-ui/icons/Print'
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

class PrintButton extends React.Component<Props, State> {
  handleKeyDown = (event: SyntheticKeyboardEvent<HTMLElement>) => {
    if (!(event.key === 'p' && event.metaKey)) return
    event.preventDefault()
    window.addEventListener('keyup', this.handleKeyUp)
  }

  handleKeyUp = (event: SyntheticKeyboardEvent<HTMLElement>) => {
    window.removeEventListener('keyup', this.handleKeyUp)
    this.props.requestPrint()
  }

  handleChangePaperSize = (e: SyntheticInputEvent<HTMLSelectElement>) => {
    // $FlowFixMe - Flow doesn't recognize value being one of options
    const value: PaperSize = e.currentTarget.value
    this.props.changePaperSize(value)
  }

  render() {
    return (
      <React.Fragment>
        <ToolbarButton>
          <PrintIcon />
          <FormattedMessage {...messages.print} />
        </ToolbarButton>
      </React.Fragment>
    )
  }
}

export default PrintButton
