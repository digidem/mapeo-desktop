import React from 'react'
import styled from 'styled-components'
import {shell} from 'electron'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'

import ImportProgressBar from './ImportProgressBar'
import views from './views'
import IndexesBar from './IndexesBar'

var SidebarDiv = styled.div`
  z-index: var(--visible-z-index);
  position: absolute;
  padding: 10px 0px;
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
    }
  }

  onSidebarClick (view) {
    if (view.modal) this.props.openModal(view.component)
    else this.props.changeView(view.component)
    this.setState({open: false})
  }

  openGithub () {
    shell.openExternal('http://github.com/digidem/mapeo-desktop/issues/new')
  }

  render () {
    const {open} = this.props
    return (
      <SidebarDiv className={open ? 'open' : ''}>
        <Paper>
          <MenuList>
            <ImportProgressBar />
            <IndexesBar />
            {views.map((view, i) => {
              return (
                <MenuItem
                  key={i}
                  onClick={this.onSidebarClick.bind(this, view)}>
                  {view.label}
                </MenuItem>)
            })}
          </MenuList>
        </Paper>
      </SidebarDiv>
    )
  }
}

// <SidebarFooter>
//   <SidebarItem onClick={this.openGithub}>
//     Report Issue
//   </SidebarItem>
// </SidebarFooter>
