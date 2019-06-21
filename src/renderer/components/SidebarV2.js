import React from 'react'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import {LocationOn, SaveAlt} from '@material-ui/icons/'

import MenuItems from './MenuItems'
import i18n from '../../i18n'

const Main = styled.div`
  padding-top: 3em;
  width: 15em;
  background-color: #000033;
  color: white;
`

const Logo = styled.div`
  padding: 0 1.5em;
  margin-bottom: 0.5em;
  display: flex;
  align-items: center;
  h1 {
    font-family: 'Rubik', sans-serif;
    font-weight: 500;
    font-size: 2em;
  }
`

const MenuItem = styled.li`
  font-family: 'Rubik', sans-serif;
  font-weight: 400;
  font-size: 1em;
  padding: 0.75em 1.5em;
  display: flex;
  align-items: center;
  :hover {
    background-color: #33335C;
  }
  img {
    width: 1em;
    height: 1em;
    margin-right: 1em;
  }
`

const svgStyles = {
  marginLeft: '-0.25em',
  marginRight: '0.25em'
}

class ExportSidebarItem extends React.Component {
  render () {
    const { name, format } = this.props

    function onClick () {
      ipcRenderer.send('export-data', name, format)
    }
    var label = `${i18n('menu-export-data')} ${name}...`
    return (
      <MenuItem onClick={onClick}>
        <SaveAlt style={svgStyles} />
        {label}
      </MenuItem>
    )
  }
}

export default class SidebarV2 extends React.Component {
  onSidebarClick (view) {
    if (view.modal) return this.props.openModal(view.name)
    this.props.changeView(view.name)
  }

  render () {
    const {viewName} = this.props
    return (
      <Main>
        <Logo>
          <LocationOn style={svgStyles} />
          <h1>Mapeo</h1>
        </Logo>
        <ul>
          {MenuItems.map((view, i) => {
            var id = `menu-option-${view.name}`
            return (
              <MenuItem
                id={id}
                key={i}
                onClick={this.onSidebarClick.bind(this, view)}>
                <img src={`static/${view.icon}`} />
                {view.label}
              </MenuItem>)
          })}
          {viewName === 'MapEditor' &&
            <ExportSidebarItem name='GeoJSON' format='geojson' />
          }
          {viewName === 'MapEditor' &&
            <ExportSidebarItem name='ShapeFile' format='shapefile' />
          }
        </ul>
      </Main>
    )
  }
}
