import React from 'react'

import MapEditor from './MapEditor'
import Welcome from './Welcome'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    var showedWelcome = localStorage.getItem('showedWelcome')
    showedWelcome = false
    self.state = {
      Modal: false,
      View: showedWelcome ? MapEditor : Welcome,
      viewProps: {},
      modalProps: {}
    }
    if (!showedWelcome) localStorage.setItem('showedWelcome', true)

    var prevhash = localStorage.getItem('location')
    if (location.hash) localStorage.setItem('location', location.hash)
    else if (prevhash) location.hash = prevhash

    window.addEventListener('hashchange', function (ev) {
      localStorage.setItem('location', location.hash)
    })
  }

  changeView (View, state) {
    console.log('changing view', View, state)
    var newState = Object.assign({}, {View}, state)
    console.log('new state', newState)
    this.setState(newState)
  }

  closeModal () {
    this.setState({Modal: false})
  }

  openModal (Modal, modalProps) {
    if (!modalProps) modalProps = {}
    this.setState({Modal, modalProps})
  }

  render () {
    const {View, Modal} = this.state

    return (
      <div className='full'>
        {Modal && <Modal
          onClose={this.closeModal.bind(this)}
          {...this.state.modalProps}
        />}
        <View changeView={this.changeView.bind(this)}
          openModal={this.openModal.bind(this)}
          {...this.state.viewProps} />
      </div>
    )
  }
}
