import React from 'react'
import i18n from '../lib/i18n'
import {ipcRenderer} from 'electron'

export default class IndexesBar extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    this.state = {
      loading: false
    }
    ipcRenderer.on('indexes-loading', self.indexesLoading.bind(self))
    ipcRenderer.on('indexes-ready', self.indexesReady.bind(self))
  }

  indexesReady () {
    this.setState({loading: false})
  }

  indexesLoading () {
    console.log('hi loading')
    this.setState({loading: true})
  }

  render () {
    const {loading} = this.state
    if (!loading) return null
    return (
      <div className='progress-bar-wrapper'>
        {i18n('generating-indexes-body')}
      </div>
    )
  }
}
