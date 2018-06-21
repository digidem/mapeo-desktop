import React from 'react'
import styled from 'styled-components'
import {ipcRenderer, shell} from 'electron'

import ImportProgressBar from './ImportProgressBar'
import IndexesBar from './IndexesBar'
import Overlay from './Overlay'
import MapEditor from './MapEditor'
import SyncView from './SyncView'

var SidebarItem = styled.div`
  font-size: 14px;
  padding: 5px 20px;
  color: black;
  &:hover {
    background-color: var(--button-hover-bg-color);
    color: var(--button-hover-color);
    cursor: pointer;
  }
`

var MenuButton = styled.div`
  font-size: 14px;
  max-height: 60px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  z-index: var(--visible-z-index);
  position: absolute;
  color: black;
  background-color: white;
  top: 10px;
  right: 10px;
  border-radius: 5px;
  min-width: 100px;
  &:hover {
    background-color: #ececec;
    color: black;
    cursor: pointer;
  }
  .notification {
    background-color: var(--main-bg-color);
    border-radius: 50%;
    width: 15px;
    height: 15px;
    line-height: 15px;
    color: white;
    font-size: 10px;
    position: absolute;
    margin-left: 5px;
    top: 5px;
    right: 15px;
  }
`

var SidebarDiv = styled.div`
  z-index: var(--visible-z-index);
  position: absolute;
  padding: 10px 0px;
  text-align: right;
  border-radius: 5px;
  background-color: white;
  color: black;
  max-width: 200px;
  right: 50px;
  top: 50px;
  display: none;
  &.open {
    display: block;
  }
`

export default class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sidebar: false,
      notifications: 0
    }
  }

  removeNotification () {
    this.setState({
      notifications: Math.max(this.state.notifications - 1, 0)
    })
  }
  addNotification () {
    this.setState({
      notifications: this.state.notifications + 1
    })
  }

  componentDidMount () {
    ipcRenderer.on('indexes-loading', this.addNotification.bind(this))
    ipcRenderer.on('indexes-ready', this.removeNotification.bind(this))
  }

  onSidebarClick (view) {
    if (view.modal) this.props.openModal(view.component)
    else this.props.changeView(view.component)
    this.setState({sidebar: false})
  }

  toggleSidebar () {
    this.setState({
      sidebar: !this.state.sidebar,
      notifications: 0
    })
  }

  openGithub () {
    shell.openExternal('http://github.com/digidem/mapeo-desktop/issues/new')
  }

  render () {
    const {notifications, sidebar} = this.state

    var views = [
      {
        component: MapEditor,
        label: 'Map Editor'
      },
      // {
      //   component: 'MapFilter',
      //   label: 'Map Filter'
      // },
      {
        component: SyncView,
        label: 'Sync with...'
      }
    ]

    return (<Overlay>
      <MenuButton onClick={this.toggleSidebar.bind(this)}>
        Menu {notifications > 0 && <div className='notification'>{notifications}</div>}
      </MenuButton>

      {<SidebarDiv className={sidebar ? 'open' : ''}>
        <ImportProgressBar />
        <IndexesBar />
        {views.map((view, i) => {
          return (
            <SidebarItem
              key={i}
              onClick={this.onSidebarClick.bind(this, view)}>
              {view.label}
            </SidebarItem>)
        })}
      </SidebarDiv>

      }
    </Overlay>
    )
  }
}

// <SidebarFooter>
//   <SidebarItem onClick={this.openGithub}>
//     Report Issue
//   </SidebarItem>
// </SidebarFooter>
