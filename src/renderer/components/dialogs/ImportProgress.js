import React from 'react'
const { ipcRenderer } = window.electron

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import LinearProgress from '@material-ui/core/LinearProgress'

import i18n from '../../../i18n'

export default class ImportProgressDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
    this.closeProgress = this.closeProgress.bind(this)
    this.onDone = this.onDone.bind(this)
    this.importProgress = this.importProgress.bind(this)
    this.onError = this.onError.bind(this)
    this.handleOK = this.handleOK.bind(this)
  }

  onDone () {
    var title = i18n('menu-import-data-success')
    this.setState({ open: true, title, total: 100 })
  }

  closeProgress () {
    this.setState({ open: false, title: false, index: 0, total: 0 })
  }

  importProgress (_, title, index, total) {
    if (this.state.total === 100) return
    this.setState({ open: true, title, index, total })
  }

  handleOK () {
    // XXX(KM): ideally we could just flush the data, but iD editor is having
    // trouble with showing data for some reason after import, so we force refresh the window
    // See src/renderer/components/MapEditor.js for details
    ipcRenderer.send('force-refresh-window')
    this.closeProgress()
  }

  onError (_, err) {
    this.closeProgress()
    ipcRenderer.send('error', err)
  }

  componentDidMount () {
    ipcRenderer.on('import-error', this.onError)
    ipcRenderer.on('import-complete', this.onDone)
    ipcRenderer.on('import-progress', this.importProgress)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('import-error', this.onError)
    ipcRenderer.removeListener('import-complete', this.onDone)
    ipcRenderer.removeListener('import-progress', this.importProgress)
  }

  render () {
    const { index, total, title, open } = this.state
    var complete = total === 100
    return (
      <Dialog disableBackdropClick disableEscapeKeyDown open={open}>
        <DialogTitle> {title} </DialogTitle>
        <DialogContent>
          {!complete && (
            <LinearProgress
              variant='determinate'
              value={Math.round(index / total) * 100}
            />
          )}
          {complete && (
            <DialogActions>
              <Button onClick={this.handleOK}>OK</Button>
            </DialogActions>
          )}
        </DialogContent>
      </Dialog>
    )
  }
}
