import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

export default class ErrorDialog extends React.Component {
  render () {
    // TODO: escape this html for displaying newlines
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <textarea cols='20' rows='40' value={this.props.message} disabled={true} />
        </DialogContent>
      </Dialog>
    )
  }
}
