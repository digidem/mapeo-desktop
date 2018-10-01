import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'

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
      <Dialog onClose={onClose} open={open} onKeyDown={this.onKeyDown.bind(this)} onClick={this.onClickModal} {...this.props}>
        {title && <DialogTitle>{title}</DialogTitle>}
        {this.props.children}
      </Dialog>
    )
  }
}

Modal.defaultProps = {
  open: true
}
