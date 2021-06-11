#!/usr/bin/env node

const glob = require('glob')
const util = require('util')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function readJson (file) {
  return JSON.parse(await readFile(file))
}

async function writeJson (file, data) {
  await mkdirp(path.dirname(file))
  await writeFile(file, JSON.stringify(data, null, 2))
}

mkdirp.sync('translations')
rimraf.sync('translations/*')

// "shared" strings are included in translations for all components
glob('messages/renderer/*.json', async function (er, files) {
  for (var file of files) {
    const msgs = await readJson(file)
    const translations = Object.keys(msgs).reduce((acc, key) => {
      acc[key] = msgs[key].message
      return acc
    }, {})
    await writeJson(
      path.join('translations', path.basename(file)),
      translations
    )
  }
  // const allMsgs = await Promise.all(
  //   files.map(async file => {
  //     const msgs = await readJson(file)
  //     return [file, msgs]
  //   })
  // )
  // await Promise.all(
  //   allMsgs.map(async ([file, msgs]) => {
  //     const sharedMsgs = await readJson(
  //       'messages/shared/' + path.basename(file)
  //     )
  //     const translations = {}
  //     Object.keys(msgs).forEach(key => {
  //       // For production message ids are hashed, so we need to hash the ids of
  //       // translations too
  //       const hashedKey = murmurHash(key)
  //       translations[hashedKey] = msgs[key].message
  //     })
  //     // Merge shared translations into the translations for each component
  //     Object.keys(sharedMsgs).forEach(key => {
  //       const hashedKey = murmurHash(key)
  //       translations[hashedKey] = sharedMsgs[key].message
  //     })
  //     const output = file.replace(/^messages/, 'translations')
  //     await writeJson(output, translations)
  //   })
  // )
})
