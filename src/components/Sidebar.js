import React from 'react'
import { ipcRenderer, shell } from 'electron'
import styled from 'styled-components'

import MoreVertIcon from '@material-ui/icons/MoreVert'
import i18n from '../lib/i18n'
import ImportProgressBar from './ImportProgressBar'
import IndexesBar from './IndexesBar'
import MenuItems from './MenuItems'

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
      anchorEl: null,
      notifications: 0
    }
    this.handleClose = this.handleClose.bind(this)
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
    if (view.modal) this.props.openModal(view.name)
    else this.props.changeView(view.name)
    this.handleClose()
  }

  handleClose () {
    this.setState({ anchorEl: null })
  }

  toggleSidebar (event) {
    this.setState({
      anchorEl: event.currentTarget,
      notifications: 0
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
        onClick={this.toggleSidebar.bind(this)}>
        <MoreVertIcon />
      </IconButton>
      <Menu id='the-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        <ImportProgressBar />
        <IndexesBar />
        <ExportSidebarItem name='GeoJSON' ext='geojson' />
        <ExportSidebarItem name='ShapeFile' ext='shp' />
        {MenuItems.map((view, i) => {
          var id = `menu-option-${i}`
          if (view.name === 'MapEditor') return
          return (
            <MenuItem
              id={id}
              key={i}
              onClick={this.onSidebarClick.bind(this, view)}>
              {view.label}
            </MenuItem>)
        })}
      </Menu>
    </FixedTopMenu>
    )
  }
}

class ExportSidebarItem extends React.Component {
  render () {
    const { name, ext } = this.props

    function onClick () {
      ipcRenderer.send('export-data', name, ext)
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
