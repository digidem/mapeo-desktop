var xtend = require('xtend')
var randombytes = require('randombytes')

function hex2dec (hexStr) {
  return parseInt(hexStr, 16).toString(10)
}

module.exports = function (osm, geojson, cb) {
  var docs = []
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
      docs.push(doc)
    } else if (geo.type === 'MultiPoint') {
      var rdoc = {
        type: 'relation',
        members: [],
        tags: xtend(feature.properties || {}, {
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
        tags: xtend(feature.properties || {}, {
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
        tags: xtend(feature.properties || {}, {
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
        tags: xtend(feature.properties, {
          filename: geojson.fileName
        })
      }
      docs.push(rdoc)

      geo.coordinates.forEach(function (pts) {
        var wdoc = {
          type: 'way',
          id: hex2dec(randombytes(8).toString('hex')),
          refs: [],
          tags: {
            area: 'yes'
          }
        }
        docs.push(wdoc)
        rdoc.members.push({ type: 'relation', ref: wdoc.id })

        var i = 0
        pts.forEach(function (pt) {
          var doc = {
            type: 'node',
            id: hex2dec(randombytes(8).toString('hex')),
            lat: pt[1],
            lon: pt[0]
          }
          docs.push(doc)
          wdoc.refs.push(doc.id)
          i++
          if (i === 1) first = doc.id
        })
        // areas need the last one to connect to the first one again.
        wdoc.refs.push(first)
        docs.push(wdoc)
      })
    } else if (geo.type === 'MultiPolygon') {
      var srdoc = {
        type: 'relation',
        members: [],
        tags: xtend(feature.properties || {}, {
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
            refs: [],
            tags: {
              area: 'yes'
            }
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
    var doc = docs[index]
    if (doc.id === undefined) {
      console.log(doc)
      osm.create(doc, function (err) {
        if (err) cb(err)
        else next(index+1)
      })
    } else {
      var id = doc.id
      delete doc.id
      console.log(doc)
      osm.put(id, doc, function (err) {
        if (err) cb(err)
        else next(index+1)
      })
    }
  })(0)
}
