import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import styled from 'styled-components'

var ModalBody = styled.div`
  background-color: var(--main-bg-color);
  margin: 40px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  position: relative;
  color: white;
  .close-button {
    position: absolute;
    right: -5px;
    top: -5px;
    height: inherit;
    width: 20px;
    background-color: black;
    color: white;
    border-radius: 100px;
  }
`
var ModalOverlay = styled.div`
  z-index: var(--visible-z-index);
  width: 100%;
  background-color: rgba(0,0,0,.5);
  justify-content: center;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default class Modal extends React.Component {
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
    var { open, onClose, title, closeButton } = this.props
    if (typeof closeButton === 'undefined') closeButton = true
    return (
      <Dialog onClose={onClose} open={open} onKeyDown={this.onKeyDown.bind(this)} onClick={this.onClickModal}>
        {title && <DialogTitle>{title}</DialogTitle>}
        {this.props.children}
      </Dialog>
    )
  }
}

Modal.defaultProps = {
  open: true
}
