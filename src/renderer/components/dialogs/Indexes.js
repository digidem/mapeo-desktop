import React from 'react'
const { ipcRenderer } = window.electron

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import LinearProgress from '@material-ui/core/LinearProgress'

import i18n from '../../i18n'

export default class IndexesDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.indexesLoading = this.indexesLoading.bind(this)
    this.indexesReady = this.indexesReady.bind(this)
  }

  componentDidMount () {
    ipcRenderer.on('indexes-loading', this.indexesLoading)
    ipcRenderer.on('indexes-ready', this.indexesReady)
    ipcRenderer.send('check-indexes')
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('indexes-loading', this.indexesLoading)
    ipcRenderer.removeListener('indexes-ready', this.indexesReady)
  }

  indexesReady () {
    this.setState({ loading: false })
  }

  indexesLoading () {
    this.setState({ loading: true })
  }

  render () {
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={this.state.loading}
      >
        <DialogTitle>{i18n('generating-indexes-body')}</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    )
  }
}
