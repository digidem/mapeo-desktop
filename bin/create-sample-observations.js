#!/usr/bin/env node

const fs = require('fs')

const geojson = JSON.parse(fs.readFileSync(process.argv.slice(2)[0]))

geojson.features.forEach((feature, i) => {
  fs.writeFileSync(`observation_${i}.json`, JSON.stringify({
    type: 'observation',
    tags: feature
  }))
})
