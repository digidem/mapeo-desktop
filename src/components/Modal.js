import React from 'react'
import styled from 'styled-components'

var ModalTitle = styled.div`
  background-color: var(--secondary-bg-color);
  text-align: center;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
`

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
    var { onClose, title, closeButton } = this.props
    if (typeof closeButton === 'undefined') closeButton = true
    return (<ModalOverlay onClick={this.onClickOverlay.bind(this)}>
      <ModalBody onKeyDown={this.onKeyDown.bind(this)} onClick={this.onClickModal}>
        {closeButton && <button className='close-button' onClick={onClose}>X</button>}
        {title && <ModalTitle>{title}</ModalTitle>}
        {this.props.children}
      </ModalBody>
    </ModalOverlay>
    )
  }
}
