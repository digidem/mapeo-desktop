import React from 'react'

import MapEditor from './MapEditor'
import ShareView from './ShareView'

var style = {
  backgroundColor: 'var(--main-bg-color)'
}

var sidebarStyle = {
  width: '30%',
  zIndex: 'var(--visible-z-index)',
  position: 'absolute',
  right: 0,
  textAlign: 'right'
}

export default class Header extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sidebar: false
    }
  }

  onSidebarClick (view) {
    this.props.changeView(view)
  }

  toggleSidebar () {
    this.setState({sidebar: !this.state.sidebar})
  }

  render () {
    const {sidebar} = this.state

    var views = [
      {
        instance: MapEditor,
        label: 'Map Editor'
      },
      {
        instance: 'MapFilter',
        label: 'Map Filter'
      },
      {
        instance: ShareView,
        label: 'Share Data'
      },
      {
        instance: 'ImportView',
        label: 'Import Data'
      }
    ]

    return (<div className='overlay' style={style}>
      <button onClick={this.toggleSidebar.bind(this)} className='sidebar-button'>
        Toggle Sidebar
      </button>
      {<div style={sidebarStyle}>
        {views.map((view, i) => {
          return (<div key={i} className='sidebar-item' onClick={this.onSidebarClick.bind(this, view.instance)}>
            {view.label}
          </div>)
        })}
      </div>
      }
    </div>
    )
  }
}
