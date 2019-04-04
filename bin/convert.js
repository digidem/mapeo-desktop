var hyperlog = require('hyperlog')
var level = require('level')
var path = require('path')
var Osmdb = require('osm-p2p')
var Mapeo = require('mapeo-core')
var geojson = require('osm-p2p-geojson')
var collect = require('collect-stream')

var exportGeojson = require('../src/lib/export-geojson')
var Config = require('../src/lib/user-config')

/*
 *
 * TODO:
 * - [x] user-config goes to @mapeo/config
 * - [ ] create @mapeo/migrate which requires both the old version of osm-p2p
 *   and new one
 * - [ ] move this script there
 */

/*
 * Converts mapeo data from hyperlog to kappa-core
 *
 *  node bin/convert.js <user-data-path> <presets file> <output-folder>
 *
 *  Example:
 *  $ node bin/convert.js ~/.config/Mapeo /path/to/sinangoe-6.0.mapeosettings output/
 */

module.exports = main
function main (userDataPath, settingsFile, output) {
  var config = new Config(userDataPath)

  var log = hyperlog(
    level(path.join(userDataPath, 'data', 'log')),
    {valueEncoding: 'json'}
  )
  var mapeo = new Mapeo(Osmdb(output))

  config.importSettings(settingsFile, function (err) {
    if (err) throw err

    // this makes me think mapeo-core should know about presets
    var presets = config.getSettings('presets')
    convert(log, mapeo, presets)
  })
}

function convert (log, mapeo, presets) {
  var rs = log.createReadStream()
  rs.on('data', function (data) {
    var val = data.value.v
    if (val && val.type === 'observation') {
      mapeo.observationCreate(transformObservationSchema1(val), function (err) {
        if (err) throw err
      })
    }
  })
  rs.on('error', function (err) {
    if (err) throw err
  })
  rs.on('end', function () {
    console.log('adding osm data')
    var stream = exportGeojson(log, presets)
    collect(stream, function (err, data) {
      if (err) throw err
      var fc = JSON.parse(data)
      console.log('Begin importing fc', fc)
      var importer = geojson.importer(osm)
      importer.importFeatureCollection(fc)
      importer.on('import', function (index, length) {
        console.log(`imported ${index}/${length}`)
      })
      importer.on('error', function (err) {
        if (err) throw err
      })
      importer.on('end', function () {
        console.log('done adding osm data')
      })
      // TODO: copy media over? Create a syncfile?
    })
  })
}

// Top-level props that can be modified by the user/client
var USER_UPDATABLE_PROPS = [
  'lon',
  'lat',
  'attachments',
  'tags',
  'ref',
  'metadata',
  'fields',
  'schemaVersion'
]

// All valid top-level props
var TOP_LEVEL_PROPS = USER_UPDATABLE_PROPS.concat([
  'created_at',
  'timestamp',
  'id',
  'version',
  'type'
])

var SKIP_OLD_PROPS = [
  'created_at_timestamp',
  'link',
  'device_id',
  'observedBy'
]

// Transform an observation from Sinangoe version of MM to the current format
function transformObservationSchema1 (obs) {
  var newObs = { tags: {} }
  Object.keys(obs).forEach(function (prop) {
    if (prop === 'attachments') {
      // Attachments has changed from array of strings to array of objects
      newObs.attachments = (obs.attachments || []).map(a => {
        if (typeof a !== 'string') return a
        return { id: a }
      })
    } else if (prop === 'fields') {
      // fields.answer should be a tag
      newObs.fields = obs.fields || []
      newObs.fields.forEach(f => {
        if (!f || !f.answer || !f.id) return
        newObs.tags[f.id] = f.answer
      })
    } else if (SKIP_OLD_PROPS.indexOf(prop) > -1) {
      // just ignore unused old props
    } else if (TOP_LEVEL_PROPS.indexOf(prop) > -1) {
      // Copy across valid top-level props
      newObs[prop] = obs[prop]
    } else if (prop === 'created') {
      // created is changed to created_at
      newObs.created_at = obs.created
    } else {
      newObs.tags[prop] = obs[prop]
    }
  })
  return newObs
}

main.apply(null, process.argv.slice(2))
