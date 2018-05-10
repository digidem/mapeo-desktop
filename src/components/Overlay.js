import React from 'react'
import {ipcRenderer} from 'electron'

import i18n from '../../lib/i18n'

export default class Overlay extends React.Component {
  render () {
    var onclick = function () {
      ipcRenderer.send('open-new-window', 'static/replicate_usb.html')
    }
    return (<div id='overlay'>
      <a onClick={onclick}>
        <button>
          <svg className='icon pre-text' height='18' viewBox='0 0 24 24' width='18' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <path d='M0 0h24v24H0V0z' id='a' />
            </defs>
            <clipPath id='b'>
              <use overflow='visible' xlinkHref='#a' />
            </clipPath>
            <path clipPath='url(#b)' d='M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z' />
          </svg>
          <span className='label'>{i18n('overlay-sync-usb-button')}</span>
        </button>
      </a>
      <div id='progress' />
    </div>
    )
  }
}
