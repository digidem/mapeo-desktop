import React from 'react'
import insertCss from 'insert-css'
import merge from 'lodash/merge'
import Dialogs from 'dialogs'
import { ipcRenderer, remote, shell } from 'electron'
import styled from 'styled-components'

import Sidebar from './Sidebar'
import i18n from '../lib/i18n'
import pkg from '../../package.json'

let iD = window.iD
let DOMParser = window.DOMParser

const Overlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  .menu {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`

export default class MapEditor extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    this.refreshWindow = this.refreshWindow.bind(this)
    this.zoomToDataRequest = this.zoomToDataRequest.bind(this)
    this.zoomToDataResponse = this.zoomToDataResponse.bind(this)
    this.zoomToLatLonResponse = this.zoomToLatLonResponse.bind(this)
    this.changeLanguageRequest = this.changeLanguageRequest.bind(this)
    ipcRenderer.on('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.on('zoom-to-data-response', self.zoomToDataResponse)
    ipcRenderer.on('zoom-to-latlon-response', self.zoomToLatLonResponse)
    ipcRenderer.on('change-language-request', self.changeLanguageRequest)
    ipcRenderer.on('refresh-window', self.refreshWindow)
    ipcRenderer.on('updated-settings', function () {
      self.updateSettings()
    })
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.removeListener('zoom-to-data-response', this.zoomToDataResponse)
    ipcRenderer.removeListener('zoom-to-latlon-response', this.zoomToLatLonResponse)
    ipcRenderer.removeListener('change-language-request', this.changeLanguageRequest)
    ipcRenderer.removeListener('refresh-window', this.refreshWindow)
  }

  render () {
    return (
      <div className='full'>
        <Overlay>
          <Sidebar
            changeView={this.props.changeView}
            openModal={this.props.openModal}
          />
        </Overlay>
        <div id='container' />
      </div>
    )
  }

  refreshWindow () {
    if (this.id) {
      var history = this.id.history()
      var saved = history.toJSON()
      this.id.flush()
      history.fromJSON(saved)
    }
  }

  componentDidMount () {
    var self = this
    this.mounted = true
    this.updateSettings()

    var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
    this.id = iD.Context()
      .assetPath('node_modules/id-mapeo/dist/')
      .preauth({ url: serverUrl })
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
        self.setState({ locale })
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

function latlonToPosString (pos) {
  pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
  pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
  while (pos[0].length < 10) pos[0] += '0'
  while (pos[1].length < 10) pos[1] += '0'
  return pos.toString()
}
