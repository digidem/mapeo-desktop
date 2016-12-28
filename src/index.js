/* global fetch */

const clone = require('clone')
const React = require('react')
const ReactDOM = require('react-dom')
const JSONStream = require('JSONStream')
const MapFilter = require('react-mapfilter')
const through = require('through2')
const websocket = require('websocket-stream')

const config = require('../config')
const observationServer = config.servers.observations

const observationToFeature = obs => {
  const data = obs.tags.data
  const attachments = obs.tags.attachments

  // attach attachments
  if (attachments != null) {
    data.properties.__mf_attachments = attachments.reduce((obj, k) => {
      obj[k] = `http://localhost:3210/media/${k}`

      return obj
    }, {})
  }

  return data
}

let features = []

let mapStyle = require('../static/map_style/style.json')
const baseUrl = `http://${config.servers.static.host}:${config.servers.static.port}/map_style/`
;['glyphs', 'sprite'].forEach(function (key) {
  mapStyle[key] = mapStyle[key].replace(/mapfilter:\/\//, baseUrl)
})

// TODO use IPC to detect this instead
const tileJSON = `http://${config.servers.tiles.host}:${config.servers.tiles.port}/index.json`
fetch(tileJSON)
.then(rsp => {
  // local tiles are available
  mapStyle = clone(mapStyle)
  mapStyle.sources.composite.url = tileJSON

  // reload MapFilter with an offline-capable map style
  ReactDOM.render(
    React.cloneElement(mf,
      {
        features,
        mapStyle
      }),
    document.getElementById('root'))
})

const mf = React.createElement(MapFilter, {
  features,
  mapStyle
})

fetch(`http://${observationServer.host}:${observationServer.port}/obs/list`)
  .then(rsp => rsp.text())
  .then(lines => {
    const observations = lines
      .split('\n')
      .filter(line => !!line)
      .map(JSON.parse)

    console.log('observations', observations)

    const seen = new Set(observations.map(x => x.id))

    features = observations.map(observationToFeature)

    console.log('features:', features)

    ReactDOM.render(
      React.cloneElement(mf,
        {
          features,
          mapStyle
        }),
      document.getElementById('root'))

    // start listening to the replication stream for new features
    const ws = websocket(`ws://${observationServer.host}:${observationServer.port}`)
    ws.pipe(JSONStream.parse('*.value')).pipe(through.obj((obj, _, next) => {
      if (!seen.has(obj.k)) {
        const data = observationToFeature(obj.v)
        seen.add(obj.k)
        features = features.concat([data])
        ReactDOM.render(
          React.cloneElement(mf,
            {
              features,
              mapStyle
            }),
          document.getElementById('root'))
      }
      next()
    }))
  })
  .catch(err => console.warn(err.stack))

ReactDOM.render(mf, document.getElementById('root'))
