import React from 'react'
import MapFilter from 'react-mapfilter'
import { ipcRenderer, remote } from 'electron'
import {
  FIELD_TYPE_STRING
} from 'react-mapfilter/es5/constants'
import xor from 'lodash/xor'
import differenceBy from 'lodash/differenceBy'
import url from 'url'

import MenuItem from '@material-ui/core/MenuItem'
import randomBytes from 'randombytes'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import api from '../api'
import MenuItems from './MenuItems'
import ConvertDialog from './ConvertDialog'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#39527b'
    }
  }
})

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

const styleUrl = `${osmServerHost}/styles/mapfilter-style/style.json`

class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    self.state = {
      features: [],
      mapPosition: { center: [0, 0], zoom: 0 },
      showModal: false,
      mapStyle: styleUrl
    }
    self.getFeatures()
    this.handleChangeFeatures = this.handleChangeFeatures.bind(this)
    this.zoomToDataRequest = this.zoomToDataRequest.bind(this)
    this.zoomToDataResponse = this.zoomToDataResponse.bind(this)
    this.zoomToLatLonResponse = this.zoomToLatLonResponse.bind(this)
    this.refresh = this.refresh.bind(this)
    ipcRenderer.on('refresh-window', this.refresh)
    ipcRenderer.on('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.on('zoom-to-data-response', self.zoomToDataResponse)
    ipcRenderer.on('zoom-to-latlon-response', self.zoomToLatLonResponse)
  }

  refresh () {
    window.location.reload()
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('refresh-window', this.refresh)
    ipcRenderer.removeListener('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.removeListener('zoom-to-data-response', this.zoomToDataResponse)
    ipcRenderer.removeListener('zoom-to-latlon-response', this.zoomToLatLonResponse)
  }

  zoomToLatLonResponse (_, lat, lon) {
    this.setState({
      mapPosition: { center: [lat, lon], zoom: 14 }
    })
  }

  zoomToDataResponse (_, loc) {
    this.setState({
      mapPosition: { center: loc, zoom: 14 }
    })
  }

  zoomToDataRequest () {
    ipcRenderer.send('zoom-to-data-get-centroid')
  }

  handleDatasetChange () {
    return (e) => {
      this.setState({ formId: e.target.value })
    }
  }

  handleConvertFeaturesClick () {
    return () => {
      this.setState({ showModal: 'convert' })
    }
  }

  handleChangeFeatures (changedFeatures) {
    const { features } = this.state
    const xorFeatures = xor(changedFeatures, features)
    const deleted = differenceBy(xorFeatures, changedFeatures, 'id')
    const added = differenceBy(xorFeatures, features, 'id')
    const updated = xorFeatures.filter(f => {
      return added.indexOf(f) === -1 &&
        deleted.indexOf(f) === -1 &&
        features.indexOf(f) === -1
    })

    var cb = function (err, resp) {
      if (err) return this.handleError(err)
    }

    deleted.forEach(f => api.del(f, cb))
    added.forEach(f => this.createObservation(f))
    updated.forEach(f => this.updateObservation(f))
    this.setState({ features: changedFeatures })
  }

  updateObservation (f) {
    const obs = this._observationsById[f.id]
    const newObs = Object.assign({}, obs)

    // TODO: media is currently not updated, but it will be in the future
    const WHITELIST = ['fields', 'media']
    Object.keys(f.properties || {}).forEach(function (key) {
      if (WHITELIST.indexOf(key) > -1) return
      newObs.tags[key] = f.properties[key]
    })

    // Mapeo Mobile currently expects field definitions as a property on tags
    ;(obs.tags.fields || []).forEach(function (field, i) {
      if (!f.properties || f.properties[field.id] === undefined) return
      newObs.tags.fields[i].answer = f.properties[field.id]
      newObs.tags.fields[i].answered = true
    })

    api.update(newObs, (err, obs) => {
      if (err) return this.handleError(err)
      // Keep a reference to the updated obs
      this._observationsById[obs.id] = obs
    })
  }

  createObservation (f, cb) {
    const newObs = {
      id: f.id || randomBytes(8).toString('hex'),
      type: 'observation',
      tags: f.properties || {}
    }
    if (f.geometry) {
      newObs.lon = f.geometry.coordinates[0]
      newObs.lat = f.geometry.coordinates[1]
    }
    api.create(newObs, (err, obs) => {
      if (err) return this.handleError(err)
      // Keep a reference to the updated obs
      this._observationsById[obs.id] = obs
    })
  }

  closeModal () {
    return () => { this.setState({ showModal: false }) }
  }

  getFeatures () {
    var self = this
    api.list(function (err, resp) {
      if (err) return self.handleError(err)
      const observations = JSON.parse(resp.body)
      const byId = self._observationsById = observations.reduce(observationIdReducer, {})
      // the byId reducer removes forks, so use that for the features array
      const features = Object.keys(byId)
        .map(key => byId[key])
        .map(observationToFeature)
      self.setState({ features })
    })
  }

  handleError (err) {
    // TODO: Show some kind of error message in the UI
    console.error(err)
  }

  handleChangeMapPosition (mapPosition) {
    this.setState({ mapPosition })
  }

  onMenuItemClick (view) {
    if (view.modal) this.props.openModal(view.name)
    else this.props.changeView(view.name)
  }

  render () {
    const { features, showModal, mapPosition } = this.state

    var appBarMenuItems = []

    MenuItems.forEach((view, i) => {
      var id = `menu-option-${view.name}`
      if (view.name === 'MapFilter') return
      appBarMenuItems.push(
        <MenuItem
          id={id}
          onClick={this.onMenuItemClick.bind(this, view)}>
          {view.label}
        </MenuItem>
      )
    })

    return (<div>
      <MuiThemeProvider theme={theme}>
        <MapFilter
          mapStyle={styleUrl}
          features={features}
          mapPosition={mapPosition}
          onChangeMapPosition={this.handleChangeMapPosition.bind(this)}
          onChangeFeatures={this.handleChangeFeatures}
          fieldTypes={{
            notes: FIELD_TYPE_STRING
          }}
          datasetName='mapeo'
          resizer={resizer}
          appBarMenuItems={appBarMenuItems}
          appBarTitle='Mapeo' />

        <ConvertDialog
          open={showModal === 'convert'}
          onClose={() => { this.setState({ showModal: false }) }}
          features={features} />
      </MuiThemeProvider>

    </div>)
  }
}

function observationToFeature (obs, id) {
  var feature = {
    id: obs.id,
    type: 'Feature',
    geometry: null,
    properties: {}
  }

  if (obs.lon && obs.lat) {
    feature.geometry = {
      type: 'Point',
      coordinates: [obs.lon, obs.lat]
    }
  }

  const WHITELIST = ['fields']
  Object.keys(obs.tags || {}).forEach(function (key) {
    if (WHITELIST.indexOf(key) > -1) return
    feature.properties[key] = obs.tags[key]
  })

  feature.properties.media = (obs.attachments || []).map(function (a) {
    var id = a.id || a // the phone doesn't have id property on it's attachments.
    return {
      // type: 'image' -- turns on media filtering on the sidebar.
      value: `${osmServerHost}/media/original/${id}`
    }
  })

  if (!feature.properties.notes) feature.properties.notes = ' '
  return feature
}

function resizer (src, size) {
  const parsedUrl = url.parse(src)
  // Don't resize local images
  if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') return src
  return 'https://resizer.digital-democracy.org/{width}/{height}/{url}'
    .replace('{width}', size)
    .replace('{height}', size)
    .replace('{url}', src)
}

function observationIdReducer (acc, obs) {
  if (acc[obs.id]) {
    // there is a fork
    if (obs.timestamp > acc[obs.id].timestamp) {
      // use the most recent
      acc[obs.id] = obs
    }
  } else {
    acc[obs.id] = obs
  }
  return acc
}

module.exports = Home
