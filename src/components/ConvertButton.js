import React from 'react'
import Button from '@material-ui/core/Button'
import i18n from '../lib/i18n'

const ConvertButton = function ({onClick, features}) {
  function click () {
    onClick(features)
  }

  return (
    <Button onClick={click}>
      {i18n('convert-button')}
    </Button>
  )
}

ConvertButton.defaultProps = {
  features: []
}

export default ConvertButton
