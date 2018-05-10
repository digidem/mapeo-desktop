import React from 'react'
import {ipcRenderer} from 'electron'

export default class ProgressBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      progressData: null
    }
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('import-error', console.error)
    ipcRenderer.on('import-complete', self.closeProgress.bind(self))
    ipcRenderer.on('import-progress', self.importProgress.bind(self))
  }

  closeProgress (_, title) {
    this.setState({
      progressData: null
    })
  }

  importProgress (_, title, index, total) {
    this.setState({
      progressData: {title, index, total}
    })
  }

  render () {
    const {progressData} = this.state
    if (!progressData) return null
    var style = {
      height: '24px',
      width: `${Math.round((progressData.index / progressData.total) * 100)}%`
    }
    return (
      <div className='progress-bar-wrapper'>
        {progressData.title}
        <div className='bar'>
          <div className='progress' style={style} />
        </div>
      </div>
    )
  }
}
