const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs-extra')
const { DEFAULT_CONFIG_DIR } = require('../config')

// This is a really hacky fix to an annoying problem. Currently mapeo-server has
// a fallbackPresetsDir option, but it expects the presets to be in a `default`
// subfolder inside that. In production we copy mapeo-default-settings into the
// app resources folder, with a `default` subfolder, but in dev we need to copy
// the default presets into a subfolder so we can use them in dev. TODO: Fix the
// API for mapeo-server

// Sorry about confusing naming, working around hard-coded paths in @mapeo/settings
const defaultConfigFolder = path.join(DEFAULT_CONFIG_DIR, 'default')
mkdirp(defaultConfigFolder)
fs.copySync(
  path.dirname(require.resolve('mapeo-default-settings')),
  defaultConfigFolder
)
