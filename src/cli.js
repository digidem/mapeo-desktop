#!/usr/bin/env node
var createServer = require('./server')
var getCore = require('../db')

var userDataPath = process.argv[2]
console.log(userDataPath)
var core = getCore(userDataPath)
var server = createServer(core.osm, core.media, { staticRoot: userDataPath })

server.listen(5000, function (err) {
  if (err) throw err
  console.log('listening on 5000')
})
