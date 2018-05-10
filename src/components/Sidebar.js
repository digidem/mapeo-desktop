import React from 'react'
import styled from 'styled-components'
import {shell} from 'electron'

import Overlay from './Overlay'
import MapEditor from './MapEditor'
import SyncView from './SyncView'

var SidebarItem = styled.div`
  font-size: 16px;
  padding: 10px 20px;
  color: white;
  &:hover {
    background-color: white;
    color: black;
    cursor: pointer;
  }
`

var SidebarButton = styled.button`
  z-index: var(--visible-z-index);
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 100px;
  padding: 0 15px;
`

var SidebarDiv = styled.div`
  z-index: var(--visible-z-index);
  position: absolute;
  right: -200px;
  text-align: right;
  background-color: var(--main-bg-color);
  height: 100%;
  max-width: 200px;
  transition: right .5s;
  &.open {
    right: 0px;
  }
`

export default class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sidebar: false
    }
  }

  onSidebarClick (view) {
    this.props.changeView(view)
    this.setState({sidebar: false})
  }

  toggleSidebar () {
    this.setState({sidebar: !this.state.sidebar})
  }

  openGithub () {
    shell.openExternal('http://github.com/digidem/mapeo-desktop/issues/new')
  }

  render () {
    const {sidebar} = this.state

    var views = [
      {
        instance: MapEditor,
        label: 'Editor'
      },
      // {
      //   instance: 'MapFilter',
      //   label: 'Map Filter'
      // },
      {
        instance: SyncView,
        label: 'Sync Data'
      }
      // {
      //   instance: 'ImportView',
      //   label: 'Import Data'
      // }
    ]

    return (<Overlay>
      <SidebarButton onClick={this.toggleSidebar.bind(this)}>
        Menu
      </SidebarButton>
      {<SidebarDiv className={sidebar ? 'open' : ''}>
        <SidebarItem onClick={this.toggleSidebar.bind(this)}>
          Close menu
        </SidebarItem>
        {views.map((view, i) => {
          return (
            <SidebarItem
              key={i}
              onClick={this.onSidebarClick.bind(this, view.instance)}>
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
