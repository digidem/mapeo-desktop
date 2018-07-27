import React from 'react'
import MapFilter from 'react-mapfilter'
import traverse from 'traverse'
import {ipcRenderer, remote} from 'electron'
import toBuffer from 'blob-to-buffer'
import assign from 'object-assign'
import diff from 'lodash/difference'
import path from 'path'
import {
  FIELD_TYPE_STRING,
  FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_SPACE_DELIMITED
} from 'react-mapfilter/es5/constants'
import xor from 'lodash/xor'
import differenceBy from 'lodash/differenceBy'

import api from '../api'

import Sidebar from './Sidebar'
import MapEditor from './MapEditor'
import ConvertDialog from './ConvertDialog'
import ConvertButton from './ConvertButton'
import XFormUploader from './XFormUploader'
import Title from './Title'

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

const mediaBaseUrl = `${osmServerHost}/media/`
const styleUrl = `${osmServerHost}/styles/mapfilter-style/style.json`

class Home extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    self.state = {
      featuresByFormId: {
        'Mapeo Mobile': []
      },
      mapPosition: {center: [0,0], zoom: 0},
      formId: 'Mapeo Mobile',
      showModal: false,
      mapStyle: styleUrl
    }
    self.getFeatures()
    this.zoomToDataRequest = this.zoomToDataRequest.bind(this)
    this.zoomToDataResponse = this.zoomToDataResponse.bind(this)
    this.zoomToLatLonResponse = this.zoomToLatLonResponse.bind(this)
    this.getFeatures = this.getFeatures.bind(this)
    ipcRenderer.on('refresh-window', this.getFeatures)
    ipcRenderer.on('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.on('zoom-to-data-response', self.zoomToDataResponse)
    ipcRenderer.on('zoom-to-latlon-response', self.zoomToLatLonResponse)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('refresh-window', this.getFeatures)
    ipcRenderer.removeListener('zoom-to-data-request', this.zoomToDataRequest)
    ipcRenderer.removeListener('zoom-to-data-response', this.zoomToDataResponse)
    ipcRenderer.removeListener('zoom-to-latlon-response', this.zoomToLatLonResponse)
  }

  zoomToLatLonResponse (_, lat, lon) {
    this.setState({
      mapPosition: {center: [lat, lon], zoom: 14}
    })
  }

  zoomToDataResponse (_, loc) {
    this.setState({
      mapPosition: {center: loc, zoom: 14}
    })
  }

  zoomToDataRequest () {
    ipcRenderer.send('zoom-to-data-get-centroid')
  }

  handleDatasetChange = (e) => {
    this.setState({formId: e.target.value})
  }

  handleConvertFeaturesClick = () => {
    this.setState({showModal: 'convert'})
  }

  handleChangeFeatures = (changedFeatures) => {
    const {featuresByFormId, formId} = this.state
    const features = featuresByFormId[formId]
    const xorFeatures = xor(changedFeatures, features)
    const deleted = differenceBy(xorFeatures, changedFeatures, 'id')
    const added = differenceBy(xorFeatures, features, 'id')
    const updated = xorFeatures.filter(f => added.indexOf(f) === -1 && deleted.indexOf(f) === -1)

    var cb = function (err, resp) {
      if (err) return this.handleError(err)
    }

    deleted.forEach(f => api.del(f, cb))
    added.forEach(f => function (f) {
      console.log('added', f)
      api.create(featureToObservation(f), cb)
    })
    updated.forEach(f => function (f) {
      console.log('updated', f)
      api.update(featureToObservation(f), cb)
    })
    const newFeaturesByFormId = assign({}, this.state.featuresByFormId)
    newFeaturesByFormId[this.state.formId] = changedFeatures
    this.setState({featuresByFormId: newFeaturesByFormId})
  }

  closeModal = () => {
    this.setState({showModal: false})
  }

  getFeatures () {
    var self = this
    api.list(function (err, resp) {
      if (err) return this.handleError(err)
      var features = JSON.parse(resp.body)
      self._seen = new Set(features.map(f => f.id))
      features = features.map(observationToFeature)
      self.setState(state => ({
        featuresByFormId: features.reduce(formIdReducer, assign({}, state.featuresByFormId))
      }))
    })
  }

  uploadForm = (formData) => {
    return new Promise((resolve, reject) => {
      api.create(formData, function (err, resp) {
        if (err) return reject(err)
        if (typeof formData.properties.public === 'undefined') {
          formData.properties.public = false
        }
        if (!formData.properties.summary) {
          formData.properties.summary = ''
        }
        resolve(formData)
      })
    })
  }

  onUpload = (err, features) => {
    if (err) return this.handleError(err)
    features.forEach(function (f) {
      f.properties = replaceProtocols(f.properties, mediaBaseUrl)
    })
    this.setState(state => ({
      featuresByFormId: features.reduce(formIdReducer, assign({}, state.featuresByFormId))
    }))
  }

  uploadFile = (blob, filepath) => {
    return new Promise((resolve, reject) => {
      toBuffer(blob, (err, buf) => {
        if (err) return reject(err)
        api.createMedia(opts, (err, resp) => {
          if (err) return reject(err)
          var json = JSON.parse(resp.body)
          resolve(json.id)
        })
      })
    })
  }

  handleChangeMapPosition (mapPosition) {
    this.setState({mapPosition})
  }

  render () {
    const {featuresByFormId, formId, showModal, mapPosition} = this.state
    const {changeView, openModal} = this.props
    const toolbarTitle = <Title
      onConvert={this.handleConvertFeaturesClick}
      datasets={Object.keys(featuresByFormId)}
      activeDataset={formId}
      onChange={this.handleDatasetChange} />

    var features = featuresByFormId[formId] || []

    return (<div>
      <MapFilter
        mapStyle={styleUrl}
        features={features}
        mapPosition={mapPosition}
        onChangeMapPosition={this.handleChangeMapPosition.bind(this)}
        onChangeFeatures={this.handleChangeFeatures}
        fieldTypes={{
          impacts: FIELD_TYPE_SPACE_DELIMITED,
          people: FIELD_TYPE_SPACE_DELIMITED,
          public: FIELD_TYPE_BOOLEAN,
          summary: FIELD_TYPE_STRING,
          'meta.instanceName': FIELD_TYPE_STRING
        }}
        datasetName={formId}
        fieldOrder={{
          location: 0,
          public: 1,
          summary: 2
        }}
        appBarButtons={[<Sidebar
          changeView={changeView}
          openModal={openModal}
          />]}
        appBarTitle={toolbarTitle} />

      <ConvertDialog
        open={showModal === 'convert'}
        onClose={() => { this.setState({showModal: false}) }}
        features={features} />

    </div>)
  }
}

function formIdReducer (acc, f) {
  let formId = (f.properties.meta && f.properties.meta.formId) || 'Mapeo Mobile'
  formId = formId.replace(/_v\d+$/, '')
  if (!acc[formId]) {
    acc[formId] = [f]
  } else {
    acc[formId] = acc[formId].concat([f])
  }
  return acc
}

function replaceProtocols (obj, baseUrl) {
  return traverse(obj).map(function (value) {
    if (typeof value !== 'string') return
    var newValue = value.replace(/^mapeo:\/\//, baseUrl)
    if (newValue !== value) {
      this.update(newValue)
    }
  })
}

function observationToFeature (obs, id) {
  var feature = Object.assign(obs, {
    type: 'Feature',
    geometry: null
  })

  feature.properties = obs.tags || {}

  if (obs.lon && obs.lat) {
    feature.geometry = {
      type: 'Point',
      coordinates: [obs.lon, obs.lat]
    }
  }
  feature.properties.media = obs.attachments.map(function (a) {
    // TODO: handle other image types
    return {
      type: 'image',
      value: `${osmServerHost}/media/original/${a.id}`,
      attachment: a
    }
  })

  if (typeof feature.properties.public === 'undefined') {
    feature.properties.public = false
  }
  if (!feature.properties.summary) {
    feature.properties.summary = ' '
  }
  feature.properties = replaceProtocols(feature.properties, mediaBaseUrl)
  return feature
}

function featureToObservation (feature) {
  return {
    lat: feature.lat,
    lon: feature.lon,
    tags: feature.properties,
    version: feature.version,
    attachments: feature.properties.media.map((m) => m.attachment),
  }
}

module.exports = Home

