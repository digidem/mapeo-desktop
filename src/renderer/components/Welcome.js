import Parser from 'html-react-parser'
const { ipcRenderer } = window.electron
import React from 'react'

import _i18n from '../../i18n'

function i18n (id) {
  var text = _i18n(id)
  return Parser(text)
}

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'screen-1'
    }
  }

  nextScreen (nextScreen) {
    this.setState({ screen: nextScreen })
  }

  presetsButton () {
    ipcRenderer.send('import-example-presets')
    this.props.changeView('MapEditor')
  }

  openMap () {
    this.props.changeView('MapEditor')
  }

  render () {
    const { screen } = this.state

    var openMap = this.openMap.bind(this)

    return (
      <div id='welcome' className='mapeo-container'>
        <div id='skip-intro' onClick={openMap}>
          Skip intro
        </div>
        {screen === 'screen-1' ? (
          <div id='screen-1'>
            <img src='static/Dd-square-solid-300.png' />
            <h1>{i18n('welcome-screen-1-title')}</h1>
            <p>{i18n('welcome-screen-1-subtitle')}</p>
            <button
              className='big next-screen'
              onClick={this.nextScreen.bind(this, 'screen-2')}
            >
              {i18n('welcome-screen-1-next-button')}
            </button>
          </div>
        ) : screen === 'screen-2' ? (
          <div id='screen-2'>
            <h1>{i18n('welcome-screen-2-title')}</h1>
            <h2 className='intro-text'>{i18n('welcome-screen-2-text-1')}</h2>
            <p>{i18n('welcome-screen-2-text-2')}</p>
            <p>{i18n('welcome-screen-2-text-3')}</p>
            <p>{i18n('welcome-screen-2-text-4')}</p>
            <p>{i18n('welcome-screen-2-text-5')}</p>
            <button
              className='big next-screen'
              onClick={this.nextScreen.bind(this, 'screen-3')}
            >
              {i18n('welcome-screen-2-next-button')}
            </button>
          </div>
        ) : (
          <div id='screen-3'>
            <h2 className='intro-text'>{i18n('welcome-screen-3-title')}</h2>
            <div className='action-buttons'>
              <button
                id='use-presets'
                className='big'
                onClick={this.presetsButton.bind(this)}
              >
                {i18n('welcome-screen-3-use-presets')}
              </button>
              <button id='open-map' className='big' onClick={openMap}>
                {i18n('welcome-screen-3-open-map')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}
