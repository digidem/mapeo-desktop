import React from 'react'
import {ipcRenderer} from 'electron'

import LatLonDialog from './LatLonDialog'
import IndexesBar from './IndexesBar'
import ProgressBar from './ProgressBar'
import i18n from '../lib/i18n'

export default class Overlay extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    self.state = {
      Modal: false
    }
    ipcRenderer.on('open-latlon-dialog', function () {
      self.openModal(LatLonDialog)
    })
  }

  closeModal () {
    this.setState({Modal: false})
  }

  openModal (Modal) {
    this.setState({Modal})
  }

  openReplicateWindow () {
    ipcRenderer.send('open-new-window', 'static/replicate_usb.html')
  }

  render () {
    const {Modal} = this.state
    return (<div id='overlay'>
      {Modal && <Modal onClose={this.closeModal.bind(this)} />}
      <ProgressBar />
      <IndexesBar />
    </div>
    )
  }
}
