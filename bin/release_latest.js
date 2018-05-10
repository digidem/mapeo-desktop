var Hubfs = require('hubfs.js')
var pkg = require('../package.json')

var config = {
  version: pkg.version,
  githubToken: process.env.GITHUB_TOKEN,
  repo: 'digital-democracy.org',
  owner: 'digidem',
  branches: process.env.GITHUB_BRANCH ? process.env.GITHUB_BRANCH.split(',') : ['master'],
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

gh.readFile(config.filename, {ref: config.branches[0]}, function (err, data) {
  if (err) {
    if (!(/not found/i.test(err) || err.notFound)) {
      return onError(err)
    }
  }
  var version = config.version
  var macLine = `/mapeo/latest/mac https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_v${version}_macOS.dmg`
  var windowsLine = `/mapeo/latest/windows https://github.com/digidem/mapeo-desktop/releases/download/v${version}/Installar_Mapeo_${version}_Windows.exe`
  var res = []
  data.toString().split('\n').map(function (line) {
    if (line.length > 0 && !line.match(/mapeo\/latest\//)) {
      res.push(line.trim())
    }
  })
  res.push(macLine)
  res.push(windowsLine)
  data = res.join('\n')

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
