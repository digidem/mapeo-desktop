#!/usr/bin/env node

var Hubfs = require('hubfs.js')
var pkg = require('../package.json')

var config = {
  version: pkg.version,
  githubToken: process.env.GITHUB_TOKEN,
  repo: 'digital-democracy.org',
  owner: 'digidem',
  branches: process.env.GITHUB_BRANCH
    ? process.env.GITHUB_BRANCH.split(',')
    : ['master'],
  filename: '_redirects'
}
var UPDATE_MESSAGE = '[UPDATE-MAPEO-VERSION] update ' + config.filename

var hubfsOptions = {
  owner: config.owner,
  repo: config.repo,
  auth: {
    token: config.githubToken
  }
}

var gh = Hubfs(hubfsOptions)

gh.readFile(config.filename, { ref: config.branches[0] }, function (err, data) {
  if (err) {
    if (!(/not found/i.test(err) || err.notFound)) {
      return onError(err)
    }
  }
  var version = config.version
  var macLine = `/mapeo/latest/mac https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_v${version}_mac.dmg 302`
  var windowsLine = `/mapeo/latest/windows https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_v${version}_win-x64.exe 302`
  var win32Line = `/mapeo/latest/win32 https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_v${version}_win-ia32.exe 302`
  var linuxLine = `/mapeo/latest/linux https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_v${version}_linux.deb 302`
  var res = []
  data
    .toString()
    .split('\n')
    .map(function (line) {
      if (line.length > 0 && !line.match(/mapeo\/latest\/(mac|win|linux)/)) {
        res.push(line.trim())
      }
    })
  res.push(macLine)
  res.push(windowsLine)
  res.push(win32Line)
  res.push(linuxLine)
  data = res.join('\n') + '\n'

  var pending = config.branches.length
  config.branches.forEach(function (branch) {
    var opts = {
      message: UPDATE_MESSAGE,
      branch: branch
    }
    gh.writeFile(config.filename, data, opts, done)
  })

  function done (err) {
    if (err) return onError(err)
    if (--pending > 0) return
    process.exit(0)
  }
})

function onError (err) {
  console.trace(err)
}
