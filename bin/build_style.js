#!/usr/bin/env node

const request = require('request')
const traverse = require('traverse')
const uniq = require('lodash/uniq')
const urlencode = require('urlencode')
const fs = require('fs')
const path = require('path')
const pump = require('pump')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const queue = require('d3-queue').queue

const CONFIG = require('../config.json')
const markerColors = CONFIG.colors
markerColors.push(CONFIG.defaultColor)

const MAPBOX_TOKEN = CONFIG.mapboxToken
const outputDir = path.join(process.cwd(), process.argv[2])
rimraf.sync(outputDir)
mkdirp.sync(outputDir)

const mapStyle = 'mapbox://styles/mapbox/streets-v9'
const mapStyleBaseUrl = mapStyle.replace(/^mapbox:\/\/styles\//, 'https://api.mapbox.com/styles/v1/')
const mapStyleUrl = mapStyleBaseUrl + '?access_token=' + MAPBOX_TOKEN

const RANGES = ['0-255', '65280-65535', '65024-65279', '12288-12543', '65024-65279']

request(mapStyleUrl, onStyle)

function onStyle (err, res, body) {
  if (err) return console.error(err)
  const style = JSON.parse(body)
  var fontStacks = []
  traverse(style).forEach(function (x) {
    if (this.key === 'text-font') {
      if (Array.isArray(x)) {
        fontStacks.push(x.join(','))
      } else if (typeof x === 'string') {
        fontStacks.push(x)
      } else if (x.stops) {
        x.stops.forEach(stop => {
          fontStacks.push(Array.isArray(stop[1]) ? stop[1].join(',') : stop[1])
        })
      }
    }
  })
  fontStacks = uniq(fontStacks)
  style.glyphs = 'mapfilter://fonts/{fontstack}/{range}.pbf'
  const originalSprite = style.sprite
  style.sprite = 'mapfilter://sprites/sprite'
  fs.writeFileSync(path.join(outputDir, 'style.json'), JSON.stringify(style, null, 4))
  downloadFonts(fontStacks, done)
  downloadSprites(originalSprite, done)
  function done (err) {
    if (err) return console.error(err)
    console.log('DONE!')
  }
}

function downloadFonts (fontStacks, cb) {
  var q = queue(10)
  var baseUrl = 'https://api.mapbox.com/fonts/v1/gmaclennan/'
  fontStacks.forEach(stack => {
    var stackDir = path.join(outputDir, 'fonts', stack)
    mkdirp.sync(stackDir)
    var range
    var url
    var outFilepath
    for (var i = 0; i < 65536; (i = i + 256)) {
      range = i + '-' + Math.min(i + 255, 65535)
      url = baseUrl + stack + '/' + range + '.pbf' + '?access_token=' + MAPBOX_TOKEN
      outFilepath = path.join(stackDir, range + '.pbf')
      q.defer(download, url, outFilepath)
    }
  })
  q.awaitAll(cb)
}

function download (url, filepath, cb) {
  var req = request({url: url, gzip: true})
  pump(req, fs.createWriteStream(filepath), cb)
}

function downloadSprites (sprite, cb) {
  mkdirp.sync(path.join(outputDir, 'sprites'))
  const postfixes = ['.png', '.json', '@2x.png', '@2x.json']
  let pending = postfixes.length
  postfixes.forEach(function (postfix) {
    const url = sprite.replace(/^mapbox:\/\/sprites\//, 'https://api.mapbox.com/styles/v1/') +
      '/sprite' + postfix + '?access_token=' + MAPBOX_TOKEN + '&cacheBust=' + Date.now()
    const filepath = path.join(outputDir, 'sprites', 'sprite' + postfix)
    pump(request(url), fs.createWriteStream(filepath), done)
  })
  function done (err) {
    if (err) return console.error(err)
    if (--pending === 0) cb(err)
  }
}
