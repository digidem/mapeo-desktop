var mkdirp = require('mkdirp')
var concat = require('concat-stream')
var hyperquest = require('hyperquest')
var path = require('path')
var Mapeo = require('mapeo-server')
var blobstore = require('safe-fs-blob-store')
var osmdb = require('osm-p2p')
var http = require('http')

var dir = path.join(__dirname, 'test-data')
var osm = osmdb(path.join(dir, 'osm'))
var media = blobstore(path.join(dir, 'media'))

var port = 5006

var mapeo = Mapeo(osm, media, {listen: true})
var server = http.createServer(function (req, res) {
  if (!mapeo.handle(req, res)) {
    res.statusCode = 404
    res.end('404')
  }
})

server.listen(port, function () {
  console.log('listening on port', port)
  var base = `http://localhost:${port}`
  var fpath = encodeURIComponent(path.join(__dirname, 'image.jpg'))
  var href = base + '/media?file=' + fpath

  var hq = hyperquest.put(href, {})
  hq.pipe(concat({ encoding: 'string' }, function (body) {
    var hq = hyperquest.post(base + '/observations', {
      headers: {'content-type': 'application/json'}
    })
    var obj = JSON.parse(body)

    hq.on('response', function (res) {
      if (res.statusCode !== 200) console.log('create observation failed')
    })

    hq.pipe(concat({ encoding: 'string' }, function (body) {
      console.log(body)
    }))

    var obs = {
      type: 'observation',
      lat: 0.4,
      lon: 1,
      attachments: [ {
        id: obj.id
      }]
    }

    hq.end(JSON.stringify(obs))
  }))

  hq.end()

  var hq2 = hyperquest.get(base + '/sync/announce', {})
  hq2.pipe(concat({ encoding: 'string' }, function (body) {
    console.log(body)
  }))
  hq2.end()
})

process.on('SIGINT', function () {
  mapeo.api.close(function () {
    console.log('closing')
    process.exit()
  })
})
