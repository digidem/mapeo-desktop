var fs = require('fs')
var path = require('path')
var ipc = require('electron').ipcMain
var app = require('electron').app

var userDataPath = app.getPath('userData')
var presetsPath = path.join(userDataPath, 'presets.json')
var cssPath = path.join(userDataPath, 'custom.css')
var imageryPath = path.join(userDataPath, 'imagery.json')

function readJsonSync (filepath) {
  try {
    var data = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    console.error(e)
    return null
  }
}

function stringifyJson (obj) {
  return JSON.stringify(obj, null, '  ')
}

ipc.on('get-user-data', function (event, type) {
  switch (type) {
    case 'presets':
      event.returnValue = readJsonSync(presetsPath)
      break
    case 'css':
      try {
        event.returnValue = fs.readFileSync(cssPath, 'utf8')
      } catch (e) {
        console.error(e)
        event.returnValue = null
      }
      break
    case 'imagery':
      event.returnValue = readJsonSync(imageryPath)
      break
    default:
      console.warn('unhandled event', event, type)
  }
})

module.exports = {
  setPresets: function (win, presets, cb) {
    if (typeof presets === 'string') {
      try {
        presets = JSON.parse(presets)
      } catch (err) {
        return cb(err)
      }
    }
    fs.writeFile(presetsPath, stringifyJson(presets), function (err) {
      if (err) return cb(err)
      win.webContents.send('updated-user-data', 'presets', presets)
      cb()
    })
  },
  setCustomCss: function (win, css, cb) {
    fs.writeFile(cssPath, css, function (err, presets) {
      if (err) return cb(err)
      win.webContents.send('updated-user-data', 'css', css)
      cb()
    })
  },
  setImagery: function (win, imagery, cb) {
    if (typeof imagery === 'string') {
      try {
        imagery = JSON.parse(imagery)
      } catch (err) {
        return cb(err)
      }
    }
    fs.writeFile(imageryPath, stringifyJson(imagery), function (err) {
      if (err) return cb(err)
      win.webContents.send('updated-user-data', 'imagery', imagery)
      cb()
    })
  }
}
