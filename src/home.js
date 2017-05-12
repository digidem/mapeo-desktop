/* global fetch */

const React = require('react')
const h = React.createElement
const MapFilter = require('react-mapfilter').default
const {SettingsButton, PrintButton} = require('react-mapfilter/es5/components/buttons')
const FloatingActionButton = require('material-ui/FloatingActionButton').default
const ContentAdd = require('material-ui/svg-icons/content/add').default
const IconButton = require('material-ui/IconButton').default
const NotificationSync = require('material-ui/svg-icons/notification/sync').default
const {DropDownMenu} = require('material-ui/DropDownMenu')
const MenuItem = require('material-ui/MenuItem').default
const clone = require('clone')
const traverse = require('traverse')
const remote = require('electron').remote
const toBuffer = require('blob-to-buffer')
const assign = require('object-assign')

// const JSONStream = require('JSONStream')
// const through = require('through2')
// const websocket = require('websocket-stream')

const XFormUploader = require('./uploader')
const Modal = require('./modal')
const SyncData = require('./sync')
const mapStyle = require('../static/style.json')
const config = require('../config')
const obsServer = config.servers.observations
const api = remote.require('./app').api

const mediaBaseUrl = `http://${obsServer.host}:${obsServer.port}/media/`

const Title = ({datasets, activeDataset, onChange}) => (
  h('div', {}, [
    h('div', {key: 1, style: {float: 'left'}}, ['TiziTizi', ' /']),
    h(DropDownMenu, {
      key: 3,
      value: activeDataset,
      onChange: onChange,
      style: {marginLeft: -18},
      labelStyle: {color: '#ffffff', fontWeight: 300, fontSize: 20}
    }, datasets.map(d => h(MenuItem, {key: d, value: d, primaryText: d})))
  ])
)

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      featuresByFormId: {
        monitoring: []
      },
      formId: 'monitoring',
      showModal: false,
      mapStyle: 'http://localhost:8080/style.json'
    }
    this.getOfflineStyle()
    this.getFeatures()
    this.closeModal = this.closeModal.bind(this)
    this.uploadForm = this.uploadForm.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.onUpload = this.onUpload.bind(this)
    this.handleDatasetChange = this.handleDatasetChange.bind(this)
    this.ActionButton = createAddButton(this.handleAddButtonClick.bind(this))
    this.toolbarButtons = [
      createSyncButton(this.handleSyncButtonClick.bind(this)),
      PrintButton,
      SettingsButton
    ]
  }

  handleAddButtonClick () {
    this.setState({showModal: 'add'})
  }

  handleSyncButtonClick () {
    this.setState({showModal: 'sync'})
  }

  handleDatasetChange (e, i, value) {
    this.setState({formId: value})
  }

  closeModal () {
    this.setState({showModal: false})
  }

  getOfflineStyle () {
    const tileJSON = `http://${config.servers.tiles.host}:${config.servers.tiles.port}/index.json`
    const baseUrl = `http://${config.servers.static.host}:${config.servers.static.port}/`
    const offlineMapStyle = clone(mapStyle)
    ;['glyphs', 'sprite'].forEach(function (key) {
      offlineMapStyle[key] = offlineMapStyle[key].replace(/mapfilter:\/\//, baseUrl)
    })

    fetch(tileJSON)
      .then(response => {
        if (!response.ok) return console.error('local tile server not found')
        // local tiles are available
        offlineMapStyle.sources.composite.url = tileJSON
        console.log('offline!', offlineMapStyle)
        this.setState({mapStyle: offlineMapStyle})
      })
  }

  getFeatures () {
    api.observationList((err, features) => {
      if (err) return console.error(err)
      this._seen = new Set(features.map(f => f.id))
      features.forEach(function (f) {
        f.properties = replaceProtocols(f.properties, mediaBaseUrl)
      })
      this.setState(state => ({
        featuresByFormId: features.reduce(formIdReducer, assign({}, state.featuresByFormId))
      }))
    })
  }

  uploadForm (formData) {
    return new Promise((resolve, reject) => {
      api.observationCreate(formData, (err, doc) => {
        if (err) return reject(err)
        resolve(formData)
      })
    })
  }

  onUpload (features) {
    features.forEach(function (f) {
      f.properties = replaceProtocols(f.properties, mediaBaseUrl)
    })
    this.setState(state => ({
      featuresByFormId: features.reduce(formIdReducer, assign({}, state.featuresByFormId))
    }))
  }

  uploadFile (blob, filename) {
    return new Promise((resolve, reject) => {
      toBuffer(blob, (err, buffer) => {
        if (err) return reject(err)
        api.mediaCreate(filename, buffer, (err, id) => {
          if (err) return reject(err)
          resolve(id)
        })
      })
    })
  }

  render () {
    const {featuresByFormId, formId, showModal, mapStyle} = this.state
    return h('div', {}, [
      mapStyle && h(MapFilter, {
        key: 1,
        features: featuresByFormId[formId] || [],
        mapStyle: mapStyle,
        fieldTypes: {
          impacts: 'space_delimited',
          people: 'space_delimited'
        },
        actionButton: this.ActionButton,
        toolbarButtons: this.toolbarButtons,
        toolbarTitle: h(Title, {
          datasets: Object.keys(featuresByFormId),
          activeDataset: formId,
          onChange: this.handleDatasetChange
        })
      }),
      showModal && h(Modal, {
        key: 2,
        component: showModal === 'add' ? XFormUploader : SyncData,
        closeModal: this.closeModal,
        uploadForm: this.uploadForm,
        uploadFile: this.uploadFile,
        onUpload: this.onUpload
      })
    ])
  }
}

  //   // start listening to the replication stream for new features
  //   const ws = websocket(`ws://${obsServer.host}:${obsServer.port}`)
  //   ws.pipe(JSONStream.parse('*.value')).pipe(through.obj((obj, _, next) => {
  //     if (!seen.has(obj.k)) {
  //       const data = observationToFeature(obj.v)
  //       seen.add(obj.k)
  //       features = features.concat([data])
  //       ReactDOM.render(
  //         React.cloneElement(mf,
  //           {
  //             features,
  //             mapStyle
  //           }),
  //         document.getElementById('root'))
  //     }
  //     next()
  //   }))
  // })
  // .catch(err => console.warn(err.stack))

const createAddButton = (onClick) => () => (
  h(FloatingActionButton, {backgroundColor: 'rgb(210, 63, 49)', onTouchTap: onClick},
    h(ContentAdd)
  )
)

const createSyncButton = (onClick) => () => (
  h(IconButton, {tooltip: 'Sync', onTouchTap: onClick},
    h(NotificationSync, {color: 'white'})
  )
)

function formIdReducer (acc, f) {
  let formId = (f.properties.meta && f.properties.meta.formId) || 'No Form Id'
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
    var newValue = value.replace(/^mapfilter:\/\//, baseUrl)
    if (newValue !== value) {
      this.update(newValue)
    }
  })
}

module.exports = Home
