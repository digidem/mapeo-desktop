import React from 'react'
import { ipcRenderer } from 'electron'

import ImportProgress from './dialogs/ImportProgress'
import Indexes from './dialogs/Indexes'
import SyncView from './dialogs/SyncView'
import LatLonDialog from './dialogs/LatLon'
import Error from './dialogs/Error'
import MapEditor from './MapEditor'
import MapFilter from './MapFilter'
import Welcome from './Welcome'
import Loading from './Loading'
import SidebarV2 from './SidebarV2'

let localStorage = window.localStorage
let location = window.location

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    self.state = {
      Modal: false,
      View: {
        name: 'Loading',
        component: Loading,
        props: {}
      }
    }
    var prevhash = localStorage.getItem('location')
    if (location.hash) localStorage.setItem('location', location.hash)
    else if (prevhash) location.hash = prevhash

    window.addEventListener('hashchange', function (ev) {
      localStorage.setItem('location', location.hash)
    })

    ipcRenderer.on('open-latlon-dialog', function () {
      self.openModal('LatLonDialog')
    })

    ipcRenderer.on('error', function (ev, message) {
      self.openModal('Error', {message})
    })
  }

  getView (name) {
    if (!name) return Welcome
    switch (name) {
      case 'MapEditor':
        return MapEditor
      case 'MapFilter':
        return MapFilter
      case 'SyncView':
        return SyncView
      case 'LatLonDialog':
        return LatLonDialog
      case 'Error':
        return Error
      default:
        return MapFilter
    }
  }

  componentDidMount () {
    var lastView = localStorage.getItem('lastView')
    this.changeView(lastView)
  }

  changeView (name, state) {
    var component = this.getView(name)
    var View = { name, component }
    var newState = Object.assign({}, { View }, state)
    this.setState(newState)
  }

  closeModal () {
    this.setState({ Modal: false })
  }

  openModal (name, props) {
    if (!props) props = {}
    var component = this.getView(name)
    this.setState({ Modal: { name, component, props } })
  }

  render () {
    const { View, Modal } = this.state
    if (View.name !== 'Loading') localStorage.setItem('lastView', View.name)

    // XXX(KM): import progress and indexes are handled differently because
    // they will block further action with the app until the operation is
    // complete
    return (
      <div className='full-container'>
        <ImportProgress openModal={this.openModal.bind(this)} />
        <Indexes />
        {Modal && <Modal.component
          onClose={this.closeModal.bind(this)}
          changeView={this.changeView.bind(this)}
          {...this.state.Modal.props}
        />}
        <SidebarV2
          changeView={this.changeView.bind(this)}
          openModal={this.openModal.bind(this)}
        />
        <View.component
          changeView={this.changeView.bind(this)}
          openModal={this.openModal.bind(this)}
          {...this.state.View.props} />
      </div>
    )
  }
}
