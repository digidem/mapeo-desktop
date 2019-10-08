import React from 'react'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import { t } from '../i18n'

const ConvertButton = function ({ onClick, features }) {
  function click () {
    onClick(features)
  }

  return (
    <Paper>
      <Button id='convert-button' color='default' onClick={click}>
        {t('convert-button')}
      </Button>
    </Paper>
  )
}

ConvertButton.defaultProps = {
  features: []
}

export default ConvertButton
