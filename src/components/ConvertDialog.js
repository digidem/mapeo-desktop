import React from 'react'
import styled from 'styled-components'
import {ipcRenderer} from 'electron'

import api from '../api'
import Modal from './Modal'
import i18n from '../lib/i18n'

const ConvertDialogDiv = styled.div`
  padding:20px;
`

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
    const {open, features, onClose} = this.props

    var notAdded = features.filter(function (f) {
      return (f.ref === undefined && (f.properties && f.properties.element_id === undefined))
    })

    if (!open) return <div />
    return (
      <Modal onClose={onClose}>
        <ConvertDialogDiv>
          <h3>{i18n('convert-number', features.length)}</h3>
          <div>
            <p> {notAdded.length
              ? i18n('convert-detail', notAdded.length)
              : i18n('convert-nothing', features.length)}
            </p>
            <div className='button-group'>
              {notAdded.length
                ? (
                  <button className='big' onClick={this.submitHandler.bind(this)}>
                    {i18n('button-submit')}
                  </button>
                )
                : <div />
              }
              <button className='big' onClick={onClose}>
                {i18n('button-cancel')}
              </button>
            </div>
          </div>
        </ConvertDialogDiv>
      </Modal>
    )
  }
}
