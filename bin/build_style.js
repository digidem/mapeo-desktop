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

const CONFIG = require('../config.json')
const markerColors = CONFIG.colors
markerColors.push(CONFIG.defaultColor)

const markerPath = path.join(__dirname, '..', 'node_modules', 'react-mapfilter', 'svg')
const marker = fs.readFileSync(path.join(markerPath, 'marker.svg'), 'utf8')
const markerHover = fs.readFileSync(path.join(markerPath, 'marker-hover.svg'), 'utf8')

require('dotenv').config()

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN
const outputDir = path.join(process.cwd(), process.argv[2])
rimraf.sync(outputDir)
mkdirp.sync(outputDir)

const mapStyle = CONFIG.defaultMapStyle
const mapStyleBaseUrl = mapStyle.replace(/^mapbox:\/\/styles\//, 'https://api.mapbox.com/styles/v1/')
const mapStyleUrl = mapStyleBaseUrl + '?access_token=' + MAPBOX_TOKEN

const RANGES = ['0-255', '65280-65535', '65024-65279', '12288-12543', '65024-65279']

let pending = markerColors.length * 2
markerColors.forEach(function (color) {
  const markerBaseName = 'marker-' + color.replace('#', '')
  const coloredMarker = marker.replace('{{fillColor}}', color)
  const coloredMarkerHover = markerHover.replace('{{fillColor}}', color)
  request.put({
    url: mapStyleBaseUrl + '/sprite/' + markerBaseName + '?access_token=' + MAPBOX_TOKEN,
    body: coloredMarker
  }, done)
  request.put({
    url: mapStyleBaseUrl + '/sprite/' + markerBaseName + '-hover?access_token=' + MAPBOX_TOKEN,
    body: coloredMarkerHover
  }, done)
})

function done (err, res, body) {
  if (err) return console.error(err)
  if (--pending === 0) {
    request(mapStyleUrl, onStyle)
  }
}

function onStyle (err, res, body) {
  if (err) return console.error(err)
  const style = JSON.parse(body)
  const fonts = []
  traverse(style).forEach(function (x) {
    if (this.key === 'text-font') {
      if (Array.isArray(x)) {
        fonts.push.apply(fonts, x)
      } else if (typeof x === 'string') {
        fonts.push(x)
      } else {
        traverse(x).forEach(fontsFromStops)
      }
    }
  })
  function fontsFromStops (x) {
    if (typeof x === 'string') {
      fonts.push(x)
    }
  }
  const fontStack = uniq(fonts).map(s => urlencode(s)).join(',')
  style.glyphs = 'mapfilter://fonts/{range}.pbf?stack={fontstack}'
  const originalSprite = style.sprite
  style.sprite = 'mapfilter://sprites/sprite'
  fs.writeFileSync(path.join(outputDir, 'style.json'), JSON.stringify(style, null, 4))
  downloadFonts(fontStack, done)
  downloadSprites(originalSprite, done)
  function done () {
    console.log('DONE!')
  }
}

function downloadFonts (fontStack, cb) {
  mkdirp.sync(path.join(outputDir, 'fonts'))
  let pending = RANGES.length
  RANGES.forEach(function (range) {
    const url = 'https://api.mapbox.com/fonts/v1/gmaclennan/' +
      fontStack + '/' + range + '.pbf' + '?access_token=' + MAPBOX_TOKEN
    const filepath = path.join(outputDir, 'fonts', range + '.pbf')
    const req = request({
      url: url,
      gzip: true
    })
    pump(req, fs.createWriteStream(filepath), done)
  })
  function done (err) {
    if (err) return console.error(err)
    if (--pending === 0) cb(err)
  }
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
