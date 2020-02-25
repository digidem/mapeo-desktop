const spectron = require('spectron')
const child = require('child_process');
const cpFile = require('cp-file')
const fs = require('fs')
const mkdirp = require('mkdirp')
const electron = require('electron')
const path = require('path')
const PNG = require('pngjs').PNG
const rimraf = require('rimraf')

const createMockDevice = require('../../bin/mock')
const config = require('./config')

module.exports = {
  createMockDevice,
  createApp,
  endTest,
  screenshotCreateOrCompare,
  compareFiles,
  waitForLoad,
  wait,
  resetTestDataDir,
  deleteTestDataDir,
  copy
}

// Returns a promise that resolves to a Spectron Application once the app has loaded.
// Takes a Tape test. Makes some basic assertions to verify that the app loaded correctly.
function createApp (t) {
  var fakeDialog = require('spectron-fake-dialog')
  var mapeoPath = path.join(__dirname, '..', '..', 'index.js')
  if (process.env.TEST_EXECUTABLE) mapeoPath = process.env.TEST_EXECUTABLE

  const app = new spectron.Application({
    path: electron,
    args: [mapeoPath, '--datadir', config.TEST_DIR_MAPEO],
    env: {
      NODE_ENV: 'test',
      RUNNING_IN_SPECTRON: true
    },
    waitTimeout: 20e3
  })
  fakeDialog.apply(app)
  process.on('SIGTERM', () => endTest(app))
  return app
}

// Starts the app, waits for it to load, returns a promise
function waitForLoad (app, t, opts) {
  return app.start()
    .then(function () {
      app.client.getMainProcessLogs().then(function (logs) {
        logs.forEach(function (log) {
          console.log(log)
        })
      })
      app.client.waitUntilWindowLoaded()
    }).then(() => {
      // Switch to the main window
      app.client.switchWindow('Mapeo')
    }).then(() => {
      app.client.waitUntilWindowLoaded()
    })
    .then(() => wait(4000))
    .then(() => {
      app.browserWindow.focus()
      app.browserWindow
        .isVisible()
        .then(isVisible => {
          t.ok(isVisible, 'isVisible')
        })
    })
    .then(() => app)
}

// Returns a promise that resolves after 'ms' milliseconds. Default: 1 second
function wait (ms) {
  if (ms === undefined) ms = 1000 // Default: wait long enough for the UI to update
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms)
  })
}

// Quit the app, end the test, either in success (!err) or failure (err)
function endTest (app, t, err) {
  if (app && app.isRunning()) {
    return app.stop().then(() => {
      child.exec('pkill -f mapeo-desktop/index.js')
      t && t.end()
    }).catch(function (err) {
      console.error(err)
    })
  }
}

// Takes a screenshot of the app
// If we already have a reference under test/screenshots, assert that they're the same
// Otherwise, create the reference screenshot: test/screenshots/<platform>/<name>.png
function screenshotCreateOrCompare (app, t, name) {
  if (process.env.TEST_SCREENSHOTS === 'false') return t.ok('skipping screenshot test', name)
  const ssDir = path.join(__dirname, '..', 'screenshots', process.platform)
  const ssPath = path.join(ssDir, name + '.png')
  let ssBuf

  try {
    ssBuf = fs.readFileSync(ssPath)
  } catch (err) {
    ssBuf = Buffer.alloc(0)
  }
  return wait().then(function () {
    console.log('capturing page')
    return app.browserWindow.capturePage()
  }).then(function (buffer) {
    if (ssBuf.length === 0) {
      console.log('Saving screenshot ' + ssPath)
      fs.writeFileSync(ssPath, buffer)
    } else {
      const match = compareIgnoringTransparency(buffer, ssBuf)
      t.ok(match, 'screenshot comparison ' + name)
      if (!match) {
        const ssFailedPath = path.join(ssDir, name + '-failed.png')
        console.log('Saving screenshot, failed comparison: ' + ssFailedPath)
        fs.writeFileSync(ssFailedPath, buffer)
      }
    }
  })
}

// Compares two PNGs, ignoring any transparent regions in bufExpected.
// Returns true if they match.
function compareIgnoringTransparency (bufActual, bufExpected) {
  // Common case: exact byte-for-byte match
  if (Buffer.compare(bufActual, bufExpected) === 0) return true

  // Otherwise, compare pixel by pixel
  let sumSquareDiff = 0
  let numDiff = 0
  const pngA = PNG.sync.read(bufActual)
  const pngE = PNG.sync.read(bufExpected)
  if (pngA.width !== pngE.width || pngA.height !== pngE.height) return false
  const w = pngA.width
  const h = pngE.height
  const da = pngA.data
  const de = pngE.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((y * w) + x) * 4
      if (de[i + 3] === 0) continue // Skip transparent pixels
      const ca = (da[i] << 16) | (da[i + 1] << 8) | da[i + 2]
      const ce = (de[i] << 16) | (de[i + 1] << 8) | de[i + 2]
      if (ca === ce) continue

      // Add pixel diff to running sum
      // This is necessary on Windows, where rendering apparently isn't quite deterministic
      // and a few pixels in the screenshot will sometimes be off by 1. (Visually identical.)
      numDiff++
      sumSquareDiff += (da[i] - de[i]) * (da[i] - de[i])
      sumSquareDiff += (da[i + 1] - de[i + 1]) * (da[i + 1] - de[i + 1])
      sumSquareDiff += (da[i + 2] - de[i + 2]) * (da[i + 2] - de[i + 2])
    }
  }
  const rms = Math.sqrt(sumSquareDiff / (numDiff + 1))
  const l2Distance = Math.round(Math.sqrt(sumSquareDiff))
  console.log('screenshot diff l2 distance: ' + l2Distance + ', rms: ' + rms)
  return l2Distance < 10000 && rms < 100
}

// Resets the test directory, containing config.json, downloads, etc
function resetTestDataDir () {
  rimraf.sync(config.TEST_DIR)
  // Create TEST_DIR as well as /Downloads and /Desktop
  mkdirp.sync(config.TEST_DIR_DOWNLOAD)
  mkdirp.sync(config.TEST_DIR_MAPEO)
  mkdirp.sync(config.TEST_DIR_MOCK_DEVICE)
}

function deleteTestDataDir () {
  rimraf.sync(config.TEST_DIR)
}

// Makes sure two files have identical contents
function compareFiles (t, pathActual, pathExpected) {
  const bufActual = fs.readFileSync(pathActual)
  const bufExpected = fs.readFileSync(pathExpected)
  const match = Buffer.compare(bufActual, bufExpected) === 0
  t.ok(match, 'correct contents: ' + pathActual)
}

function copy (pathFrom, pathTo) {
  try {
    cpFile.sync(pathFrom, pathTo)
  } catch (err) {
    // Windows lets us create files and folders under C:\Windows\Temp,
    // but when you try to `copySync` into one of those folders, you get EPERM
    // Ignore for now...
    if (process.platform !== 'win32' || err.code !== 'EPERM') throw err
    console.log('ignoring windows copy EPERM error', err)
  }
}
