import React from 'react'
import styled from 'styled-components'

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

    if (!open) return <div />
    // TODO: internationalize
    return (
      <Modal onClose={onClose}>
        <ConvertDialogDiv>
          <h3>{features.length} {i18n('convert-number')}</h3>
          <form onSubmit={this.submitHandler.bind(this)}>
            <div className='button-group right'>
              <button className='big' type='submit'>
                {i18n('button-submit')}
              </button>
            </div>
          </form>
        </ConvertDialogDiv>
      </Modal>
    )
  }
}
