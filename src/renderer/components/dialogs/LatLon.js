import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import React, { useState } from 'react'
import { ipcRenderer } from 'electron'

import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  'dialog-enter-latlon-coordinates': 'Enter Coordinates',
  'button-submit': 'Submit'
})

const LatLonDialog = ({ onClose, open }) => {
  const { formatMessage: t } = useIntl()
  const [latLon, setLatLon] = useState()

  const submitHandler = event => {
    var rx = /(-?\d+\.?\d*)[^01234567890-]+(-?\d+\.?\d*)/
    var match = rx.exec(latLon)
    if (match) {
      var pt = [parseFloat(match[1].trim()), parseFloat(match[2].trim())]
      ipcRenderer.send('zoom-to-latlon-request', pt[0], pt[1])
      onClose()
    }
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t(m['dialog-enter-latlon-coordinates'])}</DialogTitle>
      <DialogContent>
        <FormControl>
          <Input
            id='latlon-text'
            placeholder='Lon, Lat'
            type='text'
            value={latLon}
            onChange={event => setLatLon(event.target.value)}
          />
          <DialogActions>
            <Button onClick={submitHandler}>{t(m['button-submit'])}</Button>
          </DialogActions>
        </FormControl>
      </DialogContent>
    </Dialog>
  )
}

export default LatLonDialog
