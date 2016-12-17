/* global fetch */
require('babel-polyfill')

const React = require('react')
const ReactDOM = require('react-dom')
const MapFilter = require('react-mapfilter')

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

    const features = observations
          .map(x => x.tags)
          .map(x => x.data)

    console.log('features:', features)

    ReactDOM.render(
      React.cloneElement(mf,
        {
          features
        }),
      document.getElementById('root'))
  })
  .catch(err => console.warn(err.stack))

ReactDOM.render(mf, document.getElementById('root'))
