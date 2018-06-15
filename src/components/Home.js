import React from 'react'
import {ipcRenderer} from 'electron'

import LatLonDialog from './LatLonDialog'
import MapEditor from './MapEditor'
import Welcome from './Welcome'
import Sidebar from './Sidebar'
import Overlay from './Overlay'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    var lastView = localStorage.getItem('lastView')
    self.state = {
      Modal: false,
      View: {
        component: getView(lastView),
        props: {}
      }
    }
    function getView (view) {
      if (!view) return Welcome
      switch (view) {
        case 'MapEditor':
          return MapEditor
        default:
          return MapEditor
      }
    }
    var prevhash = localStorage.getItem('location')
    if (location.hash) localStorage.setItem('location', location.hash)
    else if (prevhash) location.hash = prevhash

    window.addEventListener('hashchange', function (ev) {
      localStorage.setItem('location', location.hash)
    })

    ipcRenderer.on('open-latlon-dialog', function () {
      self.openModal(LatLonDialog)
    })
  }

  changeView (component, state) {
    var newState = Object.assign({}, {View: {component}}, state)
    this.setState(newState)
  }

  closeModal () {
    this.setState({Modal: false})
  }

  openModal (component, props) {
    if (!props) props = {}
    this.setState({Modal: {component, props}})
  }

  render () {
    const {View, Modal} = this.state
    localStorage.setItem('lastView', View.component.name)

    return (
      <div className='full'>
        {Modal && <Modal.component
          onClose={this.closeModal.bind(this)}
          {...this.state.Modal.props}
        />}
        <Overlay>
          <Sidebar
            ActiveComponent={View.component}
            changeView={this.changeView.bind(this)}
            openModal={this.openModal.bind(this)}
          />
        </Overlay>
        <View.component
          changeView={this.changeView.bind(this)}
          openModal={this.openModal.bind(this)}
          {...this.state.View.props} />
      </div>
    )
  }
}
