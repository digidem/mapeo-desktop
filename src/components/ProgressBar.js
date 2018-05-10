import React from 'react'
import {ipcRenderer} from 'electron'

export default class ProgressBar extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    this.state = {
      progressData: null
    }
    ipcRenderer.on('import-error', console.error)
    ipcRenderer.on('import-complete', self.closeProgress.bind(self))
    ipcRenderer.on('import-progress', self.importProgress.bind(self))
  }

  closeProgress (_, filename) {
    this.setSate({
      progressData: null
    })
  }

  importProgress (_, filename, index, total) {
    this.setState({
      progressData: {filename, index, total}
    })
  }

  render () {
    const {progressData} = this.state
    if (!progressData) return null
    return (
      <div className='progress-bar-wrapper'>
        Importing {progressData.filename}
        <div className='bar'>
          <div className='progress' style='height:24px;width:{Math.round((progressData.index / progressData.total) * 100)}%' />
        </div>
      </div>
    )
  }
}
