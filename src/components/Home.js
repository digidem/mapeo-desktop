import React from 'react'

import MapEditor from './MapEditor'
import SyncView from './SyncView'
import Welcome from './Welcome'
import Sidebar from './Sidebar'
import Overlay from './Overlay'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    var showedWelcome = localStorage.getItem('showedWelcome')
    self.state = {
      Modal: false,
      View: {
        component: showedWelcome ? SyncView : Welcome,
        props: {}
      }
    }
    if (!showedWelcome) localStorage.setItem('showedWelcome', true)

    var prevhash = localStorage.getItem('location')
    if (location.hash) localStorage.setItem('location', location.hash)
    else if (prevhash) location.hash = prevhash

    window.addEventListener('hashchange', function (ev) {
      localStorage.setItem('location', location.hash)
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

    return (
      <div className='full'>
        {Modal && <Modal.component
          onClose={this.closeModal.bind(this)}
          {...this.state.Modal.props}
        />}
        {!(View instanceof Welcome) && <Overlay>
          <Sidebar
            ActiveComponent={View.component}
            changeView={this.changeView.bind(this)}
          />
        </Overlay>
        }
        <View.component
          changeView={this.changeView.bind(this)}
          openModal={this.openModal.bind(this)}
          {...this.state.View.props} />
      </div>
    )
  }
}
