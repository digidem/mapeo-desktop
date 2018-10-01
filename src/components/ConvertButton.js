import React from 'react'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import i18n from '../lib/i18n'

const ConvertButton = function ({ onClick, features }) {
  function click () {
    onClick(features)
  }

  return (
    <Paper>
      <Button id='convert-button' color='default' onClick={click}>
        {i18n('convert-button')}
      </Button>
    </Paper>
  )
}

ConvertButton.defaultProps = {
  features: []
}

export default ConvertButton
