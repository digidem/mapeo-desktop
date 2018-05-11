import React from 'react'

import MapEditor from './MapEditor'
import ShareView from './ShareView'

var style = {
  backgroundColor: 'var(--main-bg-color)'
}

var sidebarStyle = {
  width: '30%'
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
        key: 'Map Editor'
      },
      {
        instance: 'MapFilter',
        key: 'Map Filter'
      },
      {
        instance: ShareView,
        key: 'Share Data'
      },
      {
        instance: 'ImportView',
        key: 'Import Data'
      }
    ]

    return (<div style={style}>
      <button onClick={this.toggleSidebar.bind(this)} className='toggle'>
        Toggle Sidebar
      </button>
      {sidebar && <div style={sidebarStyle}>
        {views.map((view) => {
          return (<div className='sidebar-item' onClick={this.onSidebarClick.bind(this, view.instance)}>
            {view.key}
          </div>)
        })}
      </div>
      }
    </div>
    )
  }
}
