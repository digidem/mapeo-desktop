import React from 'react'
import MapFilter from 'react-mapfilter'
import { ipcRenderer, remote } from 'electron'
import {
  FIELD_TYPE_DATE,
  FIELD_TYPE_STRING
} from 'react-mapfilter/es5/constants'
import xor from 'lodash/xor'
import differenceBy from 'lodash/differenceBy'
import url from 'url'

import MenuItem from '@material-ui/core/MenuItem'
import { randomBytes } from 'crypto'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import xhr from 'xhr'
import api from '../api'
import MenuItems from './MenuItems'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#39527b'
    }
  }
})

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

const DONT_UPDATE_PROPS = [
  'created_at',
  'timestamp'
]

const customStyleUrl = `${osmServerHost}/styles/default/style.json`
const defaultStyleUrl = `${osmServerHost}/static/style.json`

const fieldTypes = {
  created_at: FIELD_TYPE_DATE,
  timestamp: FIELD_TYPE_DATE,
  notes: FIELD_TYPE_STRING
}

class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    self.state = {
      features: [],
      mapPosition: {},
      showModal: false,
      mapStyle: null
    }
    self.getFeatures()
    this.handleChangeFeatures = this.handleChangeFeatures.bind(this)
    this.handleChangeMapPosition = this.handleChangeMapPosition.bind(this)
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
    ipcRenderer.send('zoom-to-data-get-centroid', 'observation')
  }

  handleDatasetChange () {
    return (e) => {
      this.setState({ formId: e.target.value })
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

    deleted.forEach(f => this.deleteObservation(f))
    added.forEach(f => this.createObservation(f))
    updated.forEach(f => this.updateObservation(f))
    this.setState({ features: changedFeatures })
  }

  updateObservation (f) {
    const obs = this._observationsById[f.id]
    const newObs = Object.assign({}, obs)

    Object.keys(f.properties || {}).forEach(function (key) {
      if (DONT_UPDATE_PROPS.indexOf(key) === -1) newObs.tags[key] = f.properties[key]
    })

    api.update(newObs, (err, obs) => {
      if (err) return this.handleError(err)
      // Keep a reference to the updated obs
      this._observationsById[obs.id] = obs
    })
  }

  componentWillMount () {
    xhr(customStyleUrl, (err, resp, body) => {
      if (err || resp.statusCode !== 200) this.setState({ mapStyle: defaultStyleUrl })
      else this.setState({ mapStyle: customStyleUrl })
    })
  }

  deleteObservation (f) {
    api.del({id: f.id}, (err, resp, obs) => {
      if (err) return this.handleError(err)
      delete this._observationsById[f.id]
    })
  }

  createObservation (f) {
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
    this.setState({ showModal: false })
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
    console.error(err)
    ipcRenderer.send('error', err.message)
  }

  handleChangeMapPosition (mapPosition) {
    this.setState({ mapPosition })
  }

  onMenuItemClick (view) {
    if (view.modal) this.props.openModal(view.name)
    else this.props.changeView(view.name)
  }

  render () {
    const { features, mapPosition, mapStyle } = this.state

    // TODO: get from parent component (Home.js/app.js)
    const locale = 'es'

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

    if (!mapStyle) return <div>Loading..</div>

    return (<div>
      <MuiThemeProvider theme={theme}>
        <MapFilter
          locale={locale}
          mapStyle={mapStyle}
          features={features}
          mapPosition={mapPosition}
          onChangeMapPosition={this.handleChangeMapPosition}
          onChangeFeatures={this.handleChangeFeatures}
          fieldTypes={fieldTypes}
          datasetName='Mapeo-Mobile'
          resizer={resizer}
          appBarTitle='Filtrar'
          appBarMenuItems={appBarMenuItems} />

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

  Object.keys(obs.tags || {}).forEach(function (key) {
    feature.properties[key] = obs.tags[key]
  })

  feature.properties.media = (obs.attachments || []).map(function (a) {
    var id = a.id || a // the phone doesn't have id property on it's attachments.
    return {
      // type: 'image' -- turns on media filtering on the sidebar.
      value: `${osmServerHost}/media/original/${id}`
    }
  })

  feature.properties.timestamp = obs.timestamp
  feature.properties.created_at = obs.created_at

  if (!feature.properties.notes) feature.properties.notes = ' '
  return feature
}

function resizer (src, size) {
  const parsedUrl = url.parse(src)
  // Try to find thumbnail size
  if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
    var modifier = '/preview/'
    if (size > 0 && size <= 400) modifier = '/thumbnail/'
    return src.replace('/original/', modifier)
  }
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
