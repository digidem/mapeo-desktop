#!/usr/bin/env node

// This script removes unnecessary artifacts that we don't want to keep around after electron builder runs on CI

const rimraf = require('rimraf')

const variant = process.argv[2]

if (!variant) {
  console.error(new Error('Must specify variant'))
  process.exit(1)
}

const files = `dist/${variant}/!(*.exe|*.deb|*.AppImage|*.dmg|*.yml|*.zip|github)`

console.log(`Attempting to remove: ${files}`)

rimraf(files, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('Success!')
    process.exit(0)
  }
})
