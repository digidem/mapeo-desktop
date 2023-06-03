import React from 'react'
import Button from '@material-ui/core/Button'
import { defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({
  // Button text to turn off filters for a field
  showAll: {
    id: 'renderer.components.MapFilter.FilterPanel.ShowAllButton.showAll',
    defaultMessage: 'All'
  }
})

const ShowAllButton = props => (
  <Button color='primary' size='small' {...props}>
    <FormattedMessage {...messages.showAll} />
  </Button>
)

export default ShowAllButton
