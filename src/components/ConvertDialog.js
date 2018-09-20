import React from 'react'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { ipcRenderer } from 'electron'

import api from '../api'
import Modal from './Modal'
import i18n from '../lib/i18n'

export default class ConvertDialog extends React.Component {
  submitHandler (event) {
    this.props.features.forEach(function (feature) {
      api.convert(feature, function (err, resp) {
        if (err) console.error(err)
        if (resp.statusCode !== 400) console.log(resp.body)
      })
    })

    ipcRenderer.send('refresh-window')
    // TODO: better error handling
    this.props.onClose()
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  render () {
    const { open, features, onClose } = this.props

    var notAdded = features.filter(function (f) {
      return (f.ref === undefined && (f.properties && f.properties.element_id === undefined))
    })

    if (!open) return <div />
    return (
      <Modal id='convert-dialog' onClose={onClose}>
        <DialogTitle>{i18n('convert-number', features.length)}</DialogTitle>
        <DialogContent>
          <p> {notAdded.length
            ? i18n('convert-detail', notAdded.length)
            : i18n('convert-nothing', features.length)}
          </p>
          {notAdded.length
            ? (
              <DialogActions>
                <Button onClick={onClose}>
                  {i18n('button-cancel')}
                </Button>
                <Button id='convert-submit' color='primary' onClick={this.submitHandler.bind(this)}>
                  {i18n('button-submit')}
                </Button>
              </DialogActions>
            )
            : <div />
          }
        </DialogContent>
      </Modal>
    )
  }
}
