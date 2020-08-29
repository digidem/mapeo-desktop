// @flow
import React from 'react'
import PrintIcon from '@material-ui/icons/Print'
import { defineMessages, FormattedMessage } from 'react-intl'

import ToolbarButton from '../internal/ToolbarButton'

const messages = defineMessages({
  // Button label to print a report
  print: 'Print'
})

type Props = {
  disabled: boolean,
  url: string
}

class PrintButton extends React.Component<Props, State> {

  download () {
    var anchor = document.createElement('a')
    anchor.href = this.url
    anchor.download = 'report.pdf'
    anchor.click()
  }

  render () {
    const { disabled } = this.props

    return (
      <React.Fragment>
        <ToolbarButton onClick={this.download.bind(this)} disabled={disabled}>
          <PrintIcon />
          <FormattedMessage {...messages.print} />
        </ToolbarButton>
      </React.Fragment>
    )
  }
}

export default PrintButton
