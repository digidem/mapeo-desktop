import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'

export default class LatLonDialog extends React.Component {
  render () {
    const { message } = this.props
    return (
      <Dialog open onClose={this.props.onClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <TextField style='min-width=400px;' value={message} multiline error disabled />
        </DialogContent>
      </Dialog>
    )
  }
}
