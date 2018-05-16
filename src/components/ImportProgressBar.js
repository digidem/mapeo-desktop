import React from 'react'
import {ipcRenderer} from 'electron'
import ProgressBar from './ProgressBar'

export default class ImportProgressBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  closeProgress (_, title) {
    this.setState({title: false, index: 0, total: 0})
  }

  importProgress (_, title, index, total) {
    this.setState({title, index, total})
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('import-error', console.error)
    ipcRenderer.on('import-complete', self.closeProgress.bind(self))
    ipcRenderer.on('import-progress', self.importProgress.bind(self))
  }

  render () {
    return <ProgressBar {...this.state} />
  }
}
