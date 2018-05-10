import path from 'path'
import {ipcRenderer} from 'electron'
import React from 'react'
import i18n from '../../lib/i18n'

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
    var filename = path.join(__dirname, '..', 'examples', 'settings-jungle-v1.0.0.mapeosettings')
    ipcRenderer.send('import-settings', filename)
  }

  examplesButton () {
    var example = ipcRenderer.sendSync('get-example-filename')
    window.location.href = `/static/replicate_usb.html?file=${example}`
  }

  render () {
    const {screen} = this.state
    const {openMap} = this.props

    return (<div id='welcome'>
      <div id='skip-intro' onClick={openMap}>Skip intro</div>
      {screen === 'screen-1'
        ? (<div id='screen-1'>
          <img src='static/Dd-square-solid-300.png' />
          <h1>{i18n('welcome-screen-1-title')}</h1>
          <p>{i18n('welcome-screen-1-subtitle')}</p>
          <button className='big-button next-screen' onClick={this.nextScreen.bind(this, 'screen-2')}>
            {i18n('welcome-screen-1-next-button')}
          </button>
        </div>)
        : screen === 'screen-2'
          ? (<div id='screen-2'>
            <h1>
              {i18n('welcome-screen-2-title')}
            </h1>
            <h2 className='intro-text'>${i18n('welcome-screen-2-text-1')}</h2>
            <p>{i18n('welcome-screen-2-text-2')}</p>
            <p>{i18n('welcome-screen-2-text-3')}</p>
            <p>{i18n('welcome-screen-2-text-4')}</p>
            <p>{i18n('welcome-screen-2-text-5')}</p>
            <button className='big-button next-screen' onClick={this.nextScreen.bind(this, 'screen-3')}>
              {i18n('welcome-screen-2-next-button')}
            </button>
          </div>)
          : <div id='screen-3'>
            <h2 className='intro-text'>${i18n('welcome-screen-3-title')}</h2>
            <div className='action-buttons'>
              <button id='example-dataset' className='big-button' onClick={this.examplesButton}>
                {i18n('welcome-screen-3-example-dataset')}
              </button>
              <button id='use-presets' className='big-button' onClick={this.presetsButton}>
                {i18n('welcome-screen-3-use-presets')}
              </button>
              <button id='open-map' className='big-button' onClick={openMap}>
                {i18n('welcome-screen-3-open-map')}
              </button>
            </div>
          </div>
      }
    </div>
    )
  }
}
