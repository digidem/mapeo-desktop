var xtend = require('xtend')
var randombytes = require('randombytes')

function hex2dec (hexStr) {
  return parseInt(hexStr, 16).toString(10)
}

module.exports = function (osm, geojson, cb) {
  var docs = []

  var add = function (doc) {
    docs.push({
      value: doc,
      type: 'put'
    })
  }

  geojson.features.forEach(function addFeature (feature) {
    var geo = feature.geometry
    if (geo.type === 'Point') {
      var doc = {
        type: 'node',
        tags: xtend(feature.properties || {}, {
          filename: geojson.fileName
        }),
        lat: geo.coordinates[1],
        lon: geo.coordinates[0]
      }
      add(doc)
    } else if (geo.type === 'MultiPoint') {
      var rdoc = {
        type: 'relation',
        members: [],
        tags: xtend(feature.properties || {}, {
          filename: geojson.fileName
        })
      }
      add(rdoc)
      geo.coordinates.forEach(function (pt) {
        var doc = {
          type: 'node',
          lat: pt[1],
          lon: pt[0],
          id: hex2dec(randombytes(8).toString('hex')),
        }
        add(doc)
        rdoc.members.push({ type: 'node', ref: doc.id })
      })
    } else if (geo.type === 'LineString') {
      var wdoc = {
        type: 'way',
        refs: [],
        tags: xtend(feature.properties || {}, {
          filename: geojson.fileName
        })
      }
      add(wdoc)
      geo.coordinates.forEach(function (pt) {
        var doc = {
          type: 'node',
          id: hex2dec(randombytes(8).toString('hex')),
          lat: pt[1],
          lon: pt[0]
        }
        add(doc)
        wdoc.refs.push(doc.id)
      })
    } else if (geo.type === 'MultiLineString') {
      var rdoc = {
        type: 'relation',
        members: [],
        tags: xtend(feature.properties || {}, {
          filename: geojson.fileName
        })
      }
      add(rdoc)
      geo.coordinates.forEach(function (pts) {
        var wdoc = {
          type: 'way',
          id: hex2dec(randombytes(8).toString('hex')),
          refs: []
        }
        add(wdoc)
        rdoc.members.push({ type: 'way', ref: wdoc.id })

        pts.forEach(function (pt) {
          var doc = {
            type: 'node',
            id: hex2dec(randombytes(8).toString('hex')),
            lat: pt[1],
            lon: pt[0]
          }
          add(doc)
          wdoc.refs.push(doc.id)
        })
      })
    } else if (geo.type === 'Polygon') {
      var rdoc = {
        type: 'relation',
        id: hex2dec(randombytes(8).toString('hex')),
        members: [],
        tags: xtend(feature.properties, {
          filename: geojson.fileName
        })
      }
      add(rdoc)

      geo.coordinates.forEach(function (pts) {
        var wdoc = {
          type: 'way',
          id: hex2dec(randombytes(8).toString('hex')),
          refs: []
        }
        add(wdoc)
        rdoc.members.push(wdoc.id)

        pts.forEach(function (pt) {
          var doc = {
            type: 'node',
            id: hex2dec(randombytes(8).toString('hex')),
            lat: pt[1],
            lon: pt[0]
          }
          add(doc)
          wdoc.refs.push(doc.id)
        })
        add(wdoc)
      })
    } else if (geo.type === 'MultiPolygon') {
      var srdoc = {
        type: 'relation',
        members: [],
        tags: xtend(feature.properties || {}, {
          filename: geojson.fileName
        })
      }
      add(srdoc)
      geo.coordinates.forEach(function (xpts) {
        var rdoc = {
          type: 'relation',
          id: hex2dec(randombytes(8).toString('hex')),
          members: []
        }
        srdoc.members.push({ type: 'relation', ref: rdoc.id })
        add(rdoc)

        xpts.forEach(function (pts) {
          var wdoc = {
            type: 'way',
            id: hex2dec(randombytes(8).toString('hex')),
            refs: []
          }
          add(wdoc)
          rdoc.members.push({ type: 'way', ref: wdoc.id })

          pts.forEach(function (pt) {
            var doc = {
              type: 'node',
              id: hex2dec(randombytes(8).toString('hex')),
              lat: pt[1],
              lon: pt[0]
            }
            add(doc)
            wdoc.refs.push(doc.id)
          })
        })
      })
    } else if (geo.type === 'GeometryCollection') {
      geo.features.forEach(addFeature)
    }
  })
  osm.batch(docs, cb)
}
