/* global fetch */
require('babel-polyfill')

const React = require('react')
const ReactDOM = require('react-dom')
const MapFilter = require('react-mapfilter')

fetch('http://localhost:3210/obs/list')
  .then(rsp => rsp.text())
  .then(lines => {
    const observations = lines
      .split('\n')
      .filter(line => !!line)
      .map(JSON.parse)

    const features = observations.map(x => x.tags)

    // TODO just update the props
    ReactDOM.render(React.createElement(MapFilter, {features: features}), document.getElementById('root'))
  })
  .catch(err => console.warn(err.stack))

// ReactDOM.render(React.createElement(MapFilter, {features: features}), document.getElementById('root'))
