var xtend = require('xtend')
var jsonstream = require('JSONStream')
var pump = require('pump')
var through = require('through2')
var once = require('once')

module.exports = function (osm, bbox) {
  var rstream = osm.queryStream(bbox)
  var str = jsonstream.stringify()
  var wrap = through({}, null, function end (next) {
    this.push('}\n')
    next()
  })
  wrap.push('{ "type": "FeatureCollection", "features": ')
  return pump(
    rstream,
    through.obj(write, end),
    str, wrap
  )
  function write (row, enc, next) {
    var self = this
    geom(osm, row, function (err, geometry) {
      if (geometry.type === 'Point' && (!row.tags ||
        Object.keys(row.tags).length === 0)) return next()
      self.push({
        type: 'Feature',
        geometry: geometry,
        properties: xtend(row.tags || {}, {
          id: row.id,
          version: row.version
        })
      })
      next()
    })
  }
  function end (next) {
    next()
  }
}

function coordsEqual (coords1, coords2) {
  if (!coords1 || !coords2) return false
  return coords1[0] === coords2[0] && coords1[1] === coords2[1]
}

function geom (osm, doc, cb) {
  cb = once(cb)
  if (doc.type === 'node') {
    cb(null, {
      type: 'Point',
      coordinates: [ +doc.lon, +doc.lat ]
    })
  } else if (doc.type === 'way') {
    var pending = 1
    var coords = []
    ;(doc.refs || []).forEach(function (ref, ix) {
      pending++
      osm.get(ref, function (err, docs) {
        if (err) return cb(err)
        if (docs) {
          var doc = docs[Object.keys(docs)[0]] // for now
          coords[ix] = [+doc.lon, +doc.lat]
        }
        if (--pending === 0) wdone()
      })
    })
    if (--pending === 0) wdone()
    function wdone () {
      coords = coords.filter(Array.isArray)
      var type = 'LineString'
      if (coordsEqual(coords[0], coords[coords.length - 1])) {
        type = 'Polygon'
      }
      cb(null, {
        type: type,
        coordinates: type === 'LineString' ? coords : [coords]
      })
    }
  } else if (doc.type === 'relation') {
    var pending = 1
    var geoms = []
    ;(doc.members || []).forEach(function (member, ix) {
      pending++
      osm.get(member.ref, function (err, docs) {
        if (err) return cb(err)
        if (docs) {
          var doc = docs[Object.keys(docs)[0]] // for now
          geom(osm, doc, function (err, geometry) {
            geoms[ix] = geometry
            if (--pending === 0) rdone()
          })
        } else if (--pending === 0) rdone()
      })
    })
    if (--pending === 0) rdone()
    function rdone () {
      cb(null, {
        type: 'GeometryCollection',
        geometries: geoms
      })
    }
  } else cb(null, undefined)
}
