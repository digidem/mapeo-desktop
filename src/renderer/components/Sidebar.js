import React from 'react'
import { ipcRenderer, shell } from 'electron'
import styled from 'styled-components'

import MoreVertIcon from '@material-ui/icons/MoreVert'
import i18n from '../../i18n'

import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import IconButton from '@material-ui/core/IconButton'

var FixedTopMenu = styled.div`
  top: 0;
  right: 0;
  position: fixed;
  z-index: 30;
  padding: 5px;
  button {
    background-color: white;
  }
`

export default class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      anchorEl: null
    }
    this.handleClose = this.handleClose.bind(this)
  }

  onSidebarClick (view) {
    if (view.modal) this.props.openModal(view.name)
    else this.props.changeView(view.name)
    this.handleClose()
  }

  handleClose () {
    this.setState({ anchorEl: null })
  }

  toggleSidebar (event) {
    this.setState({
      anchorEl: event.currentTarget
    })
  }

  openGithub () {
    shell.openExternal('http://github.com/digidem/mapeo-desktop/issues/new')
  }

  render () {
    const { anchorEl } = this.state

    return (<FixedTopMenu>
      <IconButton
        aria-owns={anchorEl ? 'simple-menu' : null}
        aria-haspopup='true'
        title='Menu'
        onClick={this.toggleSidebar.bind(this)}>
        <MoreVertIcon />
      </IconButton>
      <Menu id='the-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        <ExportSidebarItem name='GeoJSON' format='geojson' />
        <ExportSidebarItem name='ShapeFile' format='shapefile' />
      </Menu>
    </FixedTopMenu>
    )
  }
}

class ExportSidebarItem extends React.Component {
  render () {
    const { name, format } = this.props

    function onClick () {
      ipcRenderer.send('export-data', name, format)
    }
    var label = `${i18n('menu-export-data')} ${name}...`
    return <MenuItem onClick={onClick}>{label}</MenuItem>
  }
}

// <SidebarFooter>
//   <SidebarItem onClick={this.openGithub}>
//     Report Issue
//   </SidebarItem>
// </SidebarFooter>
