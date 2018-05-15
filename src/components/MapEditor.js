import React from 'react'
import styled from 'styled-components'
import insertCss from 'insert-css'
import merge from 'lodash/merge'
import Dialogs from 'dialogs'
import {ipcRenderer, remote, shell} from 'electron'

import i18n from '../lib/i18n'
import pkg from '../../package.json'

import SyncView from './SyncView'
import LatLonDialog from './LatLonDialog'
import IndexesBar from './IndexesBar'
import Overlay from './Overlay'
import ProgressBar from './ProgressBar'

var SyncButton = styled.button`
  z-index: var(--visible-z-index);
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 100px;
  padding: 0 15px;
`

export default class MapEditor extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    ipcRenderer.on('zoom-to-data-request', self.zoomToDataRequest.bind(self))
    ipcRenderer.on('zoom-to-data-response', self.zoomToDataResponse.bind(self))
    ipcRenderer.on('zoom-to-latlon-response', self.zoomToLatLonResponse.bind(self))
    ipcRenderer.on('change-language-request', self.changeLanguageRequest.bind(self))
    ipcRenderer.on('updated-settings', function () {
      self.updateSettings()
      ipcRenderer.send('refresh-window')
    })
  }

  render () {
    return (
      <div className='full'>
        <MapEditorOverlay {...this.props} />
        <div id='container' />
      </div>
    )
  }

  componentDidMount () {
    var self = this
    this.mounted = true
    this.updateSettings()

    var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
    this.id = iD.Context()
      .assetPath('node_modules/id-mapeo/dist/')
      .preauth({url: serverUrl})
      .minEditableZoom(14)

    this.id.version = pkg.version
    this.customDefs = this.id.container()
      .append('svg')
      .style('position', 'absolute')
      .style('width', '0px')
      .style('height', '0px')
      .attr('id', 'custom-defs')
      .append('defs')

    this.customDefs.append('svg')

    this.id.ui()(document.getElementById('container'), function onLoad () {
      var links = document.querySelectorAll('a[href^="http"]')
      links.forEach(function (link) {
        var href = link.getAttribute('href')
        link.onclick = function (event) {
          event.preventDefault()
          shell.openExternal(href)
          return false
        }
      })

      var contributeBtn = document.querySelector('.overlay-layer-attribution a')
      if (contributeBtn) contributeBtn.innerHTML = i18n('feedback-contribute-button')

      // Update label on map move
      var aboutList = self.id.container().select('#about-list')
      var map = self.id.map()
      var latlon = aboutList.append('li')
        .append('span')
        .text(latlonToPosString(map.center()))
      self.id.container().on('mousemove', function () {
        var pos = map.mouseCoordinates()
        var s = latlonToPosString(pos)
        latlon.text(s)
      })
      self.updateSettings()
    })

    window.onbeforeunload = function () { self.id.save() }
  }

  zoomToLatLonResponse (_, lat, lon) {
    var self = this
    self.id.map().centerEase([lat, lon], 1000)
    setTimeout(function () {
      self.id.map().zoom(15)
    }, 1000)
  }

  zoomToDataRequest () {
    ipcRenderer.send('zoom-to-data-get-centroid')
  }

  zoomToDataResponse (_, loc) {
    var self = this
    var zoom = 14
    self.id.map().centerEase(loc, 1000)
    setTimeout(function () {
      self.id.map().zoom(zoom)
    }, 1000)
  }

  changeLanguageRequest () {
    var self = this
    var dialogs = Dialogs()
    dialogs.prompt(i18n('menu-change-language-title'), function (locale) {
      if (locale) {
        self.setState({locale})
        ipcRenderer.send('set-locale', locale)
        self.id.ui().restart(locale)
      }
    })
  }

  updateSettings () {
    var self = this
    var presets = ipcRenderer.sendSync('get-user-data', 'presets')
    var customCss = ipcRenderer.sendSync('get-user-data', 'css')
    var imagery = ipcRenderer.sendSync('get-user-data', 'imagery')
    var icons = ipcRenderer.sendSync('get-user-data', 'icons')

    if (presets) {
      if (!self.id) {
        presets.fields = merge(iD.data.presets.fields, presets.fields)
        iD.data.presets = presets
      }
    }
    if (customCss) insertCss(customCss)
    if (imagery) {
      imagery = imagery.map(function (i) {
        if (!self.id) i.id = i.name
        return i
      })
      iD.data.imagery = iD.data.imagery.concat(imagery)
    }
    if (icons) {
      var parser = new DOMParser()
      var iconsSvg = parser.parseFromString(icons, 'image/svg+xml').documentElement
      var defs = self.customDefs && self.customDefs.node()
      if (defs) defs.replaceChild(iconsSvg, defs.firstChild)
    }
  }
}

class MapEditorOverlay extends React.Component {

  componentDidMount () {
    var self = this
    ipcRenderer.on('open-latlon-dialog', function () {
      self.props.openModal(LatLonDialog)
    })
  }

  syncButton () {
    this.props.openModal(SyncView)
  }

  render () {
    return (<Overlay>
      <SyncButton onClick={this.syncButton.bind(this)}>
        {i18n('overlay-sync-usb-button')}
      </SyncButton>
      <ProgressBar />
      <IndexesBar />
    </Overlay>
    )
  }
}

function latlonToPosString (pos) {
  pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
  pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
  while (pos[0].length < 10) pos[0] += '0'
  while (pos[1].length < 10) pos[1] += '0'
  return pos.toString()
}
