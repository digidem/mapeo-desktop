var hex2dec = require('osm-p2p-db/lib/hex2dec.js')
var xtend = require('xtend')
var randombytes = require('randombytes')

module.exports = function (osm, geojson, cb) {
  var docs = []
  geojson.features.forEach(function addFeature (feature) {
    var geo = feature.geometry
    if (geo.type === 'Point') {
      var doc = {
        type: 'node',
        tags: xtend(geo.properties || {}, {
          filename: geojson.fileName
        }),
        lat: geo.coordinates[1],
        lon: geo.coordinates[0]
      }
      docs.push(doc)
    } else if (geo.type === 'MultiPoint') {
      var rdoc = {
        type: 'relation',
        members: [],
        tags: xtend(geo.properties || {}, {
          filename: geojson.fileName
        })
      }
      docs.push(rdoc)
      geo.coordinates.forEach(function (pt) {
        var doc = {
          type: 'node',
          lat: pt[1],
          lon: pt[0],
          id: hex2dec(randombytes(8).toString('hex')),
        }
        docs.push(doc)
        rdoc.members.push({ type: 'node', ref: doc.id })
      })
    } else if (geo.type === 'LineString') {
      var wdoc = {
        type: 'way',
        refs: [],
        tags: xtend(geo.properties || {}, {
          filename: geojson.fileName
        })
      }
      docs.push(wdoc)
      geo.coordinates.forEach(function (pt) {
        var doc = {
          type: 'node',
          id: hex2dec(randombytes(8).toString('hex')),
          lat: pt[1],
          lon: pt[0]
        }
        docs.push(doc)
        wdoc.refs.push(doc.id)
      })
    } else if (geo.type === 'MultiLineString') {
      var rdoc = {
        type: 'relation',
        members: [],
        tags: xtend(geo.properties || {}, {
          filename: geojson.fileName
        })
      }
      docs.push(rdoc)
      geo.coordinates.forEach(function (pts) {
        var wdoc = {
          type: 'way',
          id: hex2dec(randombytes(8).toString('hex')),
          refs: []
        }
        docs.push(wdoc)
        rdoc.members.push({ type: 'way', ref: wdoc.id })

        pts.forEach(function (pt) {
          var doc = {
            type: 'node',
            id: hex2dec(randombytes(8).toString('hex')),
            lat: pt[1],
            lon: pt[0]
          }
          docs.push(doc)
          wdoc.refs.push(doc.id)
        })
      })
    } else if (geo.type === 'Polygon') {
      var rdoc = {
        type: 'relation',
        id: hex2dec(randombytes(8).toString('hex')),
        members: [],
        tags: xtend(geo.properties, {
          filename: geojson.fileName
        })
      }
      docs.push(rdoc)

      geo.coordinates.forEach(function (pts) {
        var wdoc = {
          type: 'way',
          id: hex2dec(randombytes(8).toString('hex')),
          refs: []
        }
        docs.push(wdoc)
        rdoc.members.push(wdoc.id)

        pts.forEach(function (pt) {
          var doc = {
            type: 'node',
            id: hex2dec(randombytes(8).toString('hex')),
            lat: pt[1],
            lon: pt[0]
          }
          docs.push(doc)
          wdoc.refs.push(doc.id)
        })
        docs.push(wdoc)
      })
    } else if (geo.type === 'MultiPolygon') {
      var srdoc = {
        type: 'relation',
        members: [],
        tags: xtend(geo.properties || {}, {
          filename: geojson.fileName
        })
      }
      docs.push(srdoc)
      geo.coordinates.forEach(function (xpts) {
        var rdoc = {
          type: 'relation',
          id: hex2dec(randombytes(8).toString('hex')),
          members: []
        }
        srdoc.members.push({ type: 'relation', ref: rdoc.id })
        docs.push(rdoc)

        xpts.forEach(function (pts) {
          var wdoc = {
            type: 'way',
            id: hex2dec(randombytes(8).toString('hex')),
            refs: []
          }
          docs.push(wdoc)
          rdoc.members.push({ type: 'way', ref: wdoc.id })

          pts.forEach(function (pt) {
            var doc = {
              type: 'node',
              id: hex2dec(randombytes(8).toString('hex')),
              lat: pt[1],
              lon: pt[0]
            }
            docs.push(doc)
            wdoc.refs.push(doc.id)
          })
        })
      })
    } else if (geo.type === 'GeometryCollection') {
      geo.features.forEach(addFeature)
    }
  })
  ;(function next (index) {
    if (index >= docs.length) return cb(null)
    osm.put(docs[index], function (err) {
      if (err) cb(err)
      else next(index+1)
    })
  })(0)
}
