import path from 'path'
import Parser from 'html-react-parser'
import {ipcRenderer} from 'electron'
import React from 'react'

import _i18n from '../lib/i18n'
import MapEditor from './MapEditor'
import SyncView from './SyncView'
import View from './View'

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
    this.setState({screen: nextScreen})
  }

  presetsButton () {
    ipcRenderer.send('import-example-presets')
    this.props.changeView(MapEditor)
  }

  examplesButton () {
    var filename = ipcRenderer.sendSync('get-example-filename')
    this.props.changeView(MapEditor, {Modal: {component: SyncView, props: {filename}}})
  }

  openMap () {
    this.props.changeView(MapEditor)
  }

  render () {
    const {screen} = this.state

    var openMap = this.openMap.bind(this)

    return (<View id='welcome'>
      <div id='skip-intro' onClick={openMap}>Skip intro</div>
      {screen === 'screen-1'
        ? (<div id='screen-1'>
          <img src='static/Dd-square-solid-300.png' />
          <h1>{i18n('welcome-screen-1-title')}</h1>
          <p>{i18n('welcome-screen-1-subtitle')}</p>
          <button className='big next-screen' onClick={this.nextScreen.bind(this, 'screen-2')}>
            {i18n('welcome-screen-1-next-button')}
          </button>
        </div>)
        : screen === 'screen-2'
          ? (<div id='screen-2'>
            <h1>
              {i18n('welcome-screen-2-title')}
            </h1>
            <h2 className='intro-text'>{i18n('welcome-screen-2-text-1')}</h2>
            <p>{i18n('welcome-screen-2-text-2')}</p>
            <p>{i18n('welcome-screen-2-text-3')}</p>
            <p>{i18n('welcome-screen-2-text-4')}</p>
            <p>{i18n('welcome-screen-2-text-5')}</p>
            <button className='big next-screen' onClick={this.nextScreen.bind(this, 'screen-3')}>
              {i18n('welcome-screen-2-next-button')}
            </button>
          </div>)
          : <div id='screen-3'>
            <h2 className='intro-text'>{i18n('welcome-screen-3-title')}</h2>
            <div className='action-buttons'>
              <button id='example-dataset' className='big' onClick={this.examplesButton.bind(this)}>
                {i18n('welcome-screen-3-example-dataset')}
              </button>
              <button id='use-presets' className='big' onClick={this.presetsButton.bind(this)}>
                {i18n('welcome-screen-3-use-presets')}
              </button>
              <button id='open-map' className='big' onClick={openMap}>
                {i18n('welcome-screen-3-open-map')}
              </button>
            </div>
          </div>
      }
    </View>
    )
  }
}
