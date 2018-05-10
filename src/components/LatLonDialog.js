import React from 'react'
import {ipcRenderer} from 'electron'

import i18n from '../lib/i18n'

export default class LatLonDialog extends React.Component {
  submitHandler (event) {
    var self = this
    var text = document.getElementById('latlon-text').value
    var rx = /(-?\d+\.?\d*)[^01234567890-]+(-?\d+\.?\d*)/
    var match = rx.exec(text)
    if (match) {
      var pt = [ parseFloat(match[1].trim()), parseFloat(match[2].trim()) ]
      ipcRenderer.send('zoom-to-latlon-request', pt[0], pt[1])
      self.props.onClose()
    }
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  onKeyDown (event) {
    if (event.key === 'Enter') {
      this.submitHandler()
    }
    if (event.key === 'Escape') {
      this.props.onClose()
    }
  }

  onClickOverlay (event) {
    this.props.onClose()
  }

  onClickModal (event) {
    event.stopPropagation()
  }

  render () {
    const { onClose } = this.props
    return (<div className='modal-overlay' onClick={this.onClickOverlay.bind(this)}>
      <div className='modal-body' onKeyDown={this.onKeyDown.bind(this)} onClick={this.onClickModal}>
        <button className='close-button' onClick={onClose}>X</button>
        <h3>{i18n('dialog-enter-latlon-coordinates')}</h3>
        <div>
          <form onSubmit={this.submitHandler.bind(this)}>
            <input id='latlon-text' placeholder='Lon, Lat' type='text' />
            <div className='button-group'>
              <button type='submit'>{i18n('button-submit')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    )
  }
}
