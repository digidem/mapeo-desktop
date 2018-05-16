import React from 'react'
import styled from 'styled-components'
import {ipcRenderer, shell} from 'electron'

import ImportProgressBar from './ImportProgressBar'
import IndexesBar from './IndexesBar'
import Overlay from './Overlay'
import MapEditor from './MapEditor'
import SyncView from './SyncView'

var SidebarItem = styled.div`
  font-size: 16px;
  padding: 10px 20px;
  color: white;
  &.active {
    background-color: var(--button-active-bg-color);
    color: var(--button-active-color);
  }
  &:hover:not(.active) {
    background-color: var(--button-hover-bg-color);
    color: var(--button-hover-color);
    cursor: pointer;
  }
`

var SidebarButton = styled.div`
  font-size: 16px;
  max-height: 60px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  z-index: var(--visible-z-index);
  position: absolute;
  color: white;
  background-color: rgba(0,0,0,.5);
  top: 10px;
  right: 10px;
  border-radius: 5px;
  min-width: 100px;
  &:hover {
    background-color: var(--button-hover-bg-color);
    color: var(--button-hover-color);
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
  right: -200px;
  text-align: right;
  background-color: rgba(0,0,0,.9);
  height: 100%;
  max-width: 200px;
  transition: right .5s;
  border-left: var(--border);
  &.open {
    right: 0px;
  }
`

export default class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sidebar: false,
      notifications: 0
    }
    ipcRenderer.on('indexes-loading', this.addNotification.bind(this))
    ipcRenderer.on('indexes-ready', this.removeNotification.bind(this))
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

  onSidebarClick (view) {
    this.props.changeView(view)
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
    const {ActiveComponent} = this.props

    var views = [
      {
        component: MapEditor,
        label: 'Editor'
      },
      // {
      //   component: 'MapFilter',
      //   label: 'Map Filter'
      // },
      {
        component: SyncView,
        label: 'Sync Data'
      }
      // {
      //   component: 'ImportView',
      //   label: 'Import Data'
      // }
    ]

    return (<Overlay>
      <SidebarButton onClick={this.toggleSidebar.bind(this)}>
        Menu {notifications > 0 && <div class='notification'>{notifications}</div>}
      </SidebarButton>

      {<SidebarDiv className={sidebar ? 'open' : ''}>
        <ImportProgressBar />
        <IndexesBar />
        {views.map((view, i) => {
          return (
            <SidebarItem
              key={i}
              className={(ActiveComponent === view.component) ? 'active' : ''}
              onClick={this.onSidebarClick.bind(this, view.component)}>
              {view.label}
            </SidebarItem>)
        })}
        <SidebarItem onClick={this.toggleSidebar.bind(this)}>
          Close menu
        </SidebarItem>
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
