import React from 'react'
import { ipcRenderer } from 'electron'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import LinearProgress from '@material-ui/core/LinearProgress'

let alert = window.alert

export default class ImportProgressDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.closeProgress = this.closeProgress.bind(this)
    this.importProgress = this.importProgress.bind(this)
    this.onError = this.onError.bind(this)
  }

  closeProgress (_, title) {
    this.setState({ loading: false, title: false, index: 0, total: 0 })
  }

  importProgress (_, title, index, total) {
    this.setState({ loading: true, title, index, total })
  }

  onError (_, err) {
    alert(err)
  }

  componentDidMount () {
    ipcRenderer.on('import-error', this.onError)
    ipcRenderer.on('import-complete', this.closeProgress)
    ipcRenderer.on('import-progress', this.importProgress)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('import-error', this.onError)
    ipcRenderer.removeListener('import-complete', this.closeProgress)
    ipcRenderer.removeListener('import-progress', this.importProgress)
  }

  render () {
    const { index, total, title, loading } = this.state
    return <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={loading}>
      <DialogTitle> {title} </DialogTitle>
      <DialogContent>
        <LinearProgress value={Math.round(index / total) * 100} />
      </DialogContent>
    </Dialog>
  }
}
