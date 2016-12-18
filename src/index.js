/* global fetch */
const React = require('react')
const ReactDOM = require('react-dom')
const JSONStream = require('JSONStream')
const MapFilter = require('react-mapfilter')
const through = require('through2')
const websocket = require('websocket-stream')

const config = require('../config')
const observationServer = config.servers.observations

const mf = React.createElement(MapFilter)

fetch(`http://${observationServer.host}:${observationServer.port}/obs/list`)
  .then(rsp => rsp.text())
  .then(lines => {
    const observations = lines
      .split('\n')
      .filter(line => !!line)
      .map(JSON.parse)

    console.log('observations', observations)

    const seen = new Set(observations.map(x => x.id))

    let features = observations
          .map(x => x.tags)
          .map(x => x.data)

    console.log('features:', features)

    ReactDOM.render(
      React.cloneElement(mf,
        {
          features
        }),
      document.getElementById('root'))

    // start listening to the replication stream for new features
    const ws = websocket(`ws://${observationServer.host}:${observationServer.port}`)
    ws.pipe(JSONStream.parse('*.value')).pipe(through.obj((obj, _, next) => {
      if (!seen.has(obj.k)) {
        const data = obj.v.tags.data
        console.log(obj.k, data)
        seen.add(obj.k)
        features = features.concat([data])
        ReactDOM.render(
          React.cloneElement(mf,
            {
              features
            }),
          document.getElementById('root'))
      }
      next()
    }))
  })
  .catch(err => console.warn(err.stack))

ReactDOM.render(mf, document.getElementById('root'))
