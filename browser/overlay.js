var ipc = require('electron').ipcRenderer
var html = require('nanohtml')
var i18n = require('../lib/i18n')

module.exports = function () {
  var onclick = function () {
    ipc.send('open-new-window', 'replicate_usb.html')
  }
  return html`
  <div>
    <a onclick=${onclick}>
        <button>
        <svg class="icon pre-text" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <path d="M0 0h24v24H0V0z" id="a"/>
          </defs>
          <clipPath id="b">
              <use overflow="visible" xlink:href="#a"/>
          </clipPath>
          <path clip-path="url(#b)" d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z"/>
        </svg>
        <span class="label">${i18n('overlay-sync-usb-button')}</span>
      </button>
    </a>
    <a style="display:none" href="replicate_network.html">
      <button>
        <svg class="icon pre-text" fill="#000000" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
        <span class="label">${i18n('overlay-sync-wifi-button')}</span>
      </button>
    </a>
  <div id="progress"></div>
  </div>
  `
}
