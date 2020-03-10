import React from 'react'
import Button from '@material-ui/core/Button'

import { defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({
  // Button text to only show a particular field value in a filter
  only: 'Only'
})

const OnlyButton = props => (
  <Button color="primary" size="small" {...props}>
    <FormattedMessage {...messages.only} />
  </Button>
)

export default OnlyButton
