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

const PrintButton = ({ url, disabled }: Props) => (
  <React.Fragment>
    <ToolbarButton
      component='a'
      href={url}
      download='report.pdf'
      disabled={disabled}
    >
      <PrintIcon />
      <FormattedMessage {...messages.print} />
    </ToolbarButton>
  </React.Fragment>
)

export default PrintButton
