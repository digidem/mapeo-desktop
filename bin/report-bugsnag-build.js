const reportBuild = require('bugsnag-build-reporter')
const path = require('path')
const { upload } = require('bugsnag-sourcemaps')

const appVersion = require('../package.json').version

const Upload = upload

var opts = {
  apiKey: process.env.BUGSNAG_API_KEY,
  appVersion,
  releaseStage: 'production'
}

reportBuild(opts)
  .then(() => console.log('successfully reported build!'))
  .catch(err => console.log('fail', err.messsage))

new Upload(Object.assign({}, opts, {
  minifiedFile: path.resolve(__dirname, '..', 'static/build.js'),
  sourceMap: path.resolve(__dirname, '..', 'static/build.js.map')
})).then(() => console.log('successfully uploaded sourcemaps!'))
  .catch(err => console.log('fail', err.messsage))
