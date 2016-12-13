/* global fetch */
require('babel-polyfill')

const React = require('react')
const ReactDOM = require('react-dom')
const MapFilter = require('react-mapfilter')

const mf = React.createElement(MapFilter)

fetch('http://localhost:3210/obs/list')
  .then(rsp => rsp.text())
  .then(lines => {
    const observations = lines
      .split('\n')
      .filter(line => !!line)
      .map(JSON.parse)

    const features = observations.map(x => x.tags)

    ReactDOM.render(
      React.cloneElement(mf,
        {
          features
        }),
      document.getElementById('root'))
  })
  .catch(err => console.warn(err.stack))

ReactDOM.render(mf, document.getElementById('root'))
