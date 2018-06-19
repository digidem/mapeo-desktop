import React from 'react'
import i18n from '../lib/i18n'
import {ipcRenderer} from 'electron'
import ProgressBar from './ProgressBar'

export default class IndexesBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.indexesLoading = this.indexesLoading.bind(this)
    this.indexesReady = this.indexesReady.bind(this)
    ipcRenderer.on('indexes-loading', this.indexesLoading)
    ipcRenderer.on('indexes-ready', this.indexesReady)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('indexes-loading', this.indexesLoading)
    ipcRenderer.removeListener('indexes-ready', this.indexesReady)
  }

  indexesReady () {
    this.setState({loading: false})
    clearInterval(this.interval)
  }

  indexesLoading () {
    var self = this
    this.setState({
      loading: true,
      title: i18n('generating-indexes-body'),
      index: 5,
      total: 100
    })
    this.interval = setInterval(function () {
      self.setState({
        index: (self.state.index + 5) % 100
      })
    }, 1000)
  }

  render () {
    if (!this.state.loading) return null

    return (
      <ProgressBar {...this.state} />
    )
  }
}
