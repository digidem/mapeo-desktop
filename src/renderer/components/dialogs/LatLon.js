import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'

import React from 'react'
import { ipcRenderer } from 'electron'

import i18n from '../../i18n'

export default class LatLonDialog extends React.Component {
  submitHandler (event) {
    var self = this
    var text = document.getElementById('latlon-text').value
    var rx = /(-?\d+\.?\d*)[^01234567890-]+(-?\d+\.?\d*)/
    var match = rx.exec(text)
    if (match) {
      var pt = [parseFloat(match[1].trim()), parseFloat(match[2].trim())]
      ipcRenderer.send('zoom-to-latlon-request', pt[0], pt[1])
      self.props.onClose()
    }
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  render () {
    const { onClose, open } = this.props
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{i18n('dialog-enter-latlon-coordinates')}</DialogTitle>
        <DialogContent>
          <FormControl>
            <Input id='latlon-text' placeholder='Lon, Lat' type='text' />
            <DialogActions>
              <Button onClick={this.submitHandler.bind(this)}>
                {i18n('button-submit')}
              </Button>
            </DialogActions>
          </FormControl>
        </DialogContent>
      </Dialog>
    )
  }
}
