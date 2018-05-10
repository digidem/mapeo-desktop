import React from 'react'

import MapEditor from './MapEditor'
import Welcome from './Welcome'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    var showedWelcome = localStorage.getItem('showedWelcome')
    self.state = {
      view: showedWelcome ? 'MapEditor' : 'Welcome'
    }
    if (!showedWelcome) localStorage.setItem('showedWelcome', true)

    var prevhash = localStorage.getItem('location')
    if (location.hash) localStorage.setItem('location', location.hash)
    else if (prevhash) location.hash = prevhash

    window.addEventListener('hashchange', function (ev) {
      localStorage.setItem('location', location.hash)
    })
  }

  changeView (view) {
    this.setState({view})
  }

  render () {
    const {view} = this.state
    if (view === 'Welcome') return <Welcome openMap={this.changeView.bind(this, 'MapEditor')} />

    return (
      <div className='full'>
        <MapEditor />
      </div>
    )
  }
}
