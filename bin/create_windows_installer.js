var mkdirp = require('mkdirp').sync
var path = require('path')
var electronInstaller = require('electron-winstaller')
var config = require('../config')

var distFolder = path.join(__dirname, '..', 'dist')
var installerFolder = path.join(distFolder, 'installer-win-x64')

function createConfiguration () {
  var buildFolder = path.join(distFolder, 'mapfilter-desktop-win32-x64')

  return {
    appDirectory: buildFolder,
    outputDirectory: installerFolder,

    usePackageJson: false,

    description: config.APP_DESCRIPTION,
    authors: config.APP_TEAM,
    name: config.APP_NAME,
    exe: config.APP_NAME + '.exe',
    setupExe: 'Installar_' + config.APP_NAME + '_' + config.APP_VERSION + '_Windows.exe',
    iconUrl: 'https://raw.githubusercontent.com/digidem/mapfilter-desktop/master/static/mapfilter.ico',
    version: config.APP_VERSION,
    title: config.APP_NAME.toLowerCase()
  }
}

mkdirp(installerFolder)

var cfg = createConfiguration()
electronInstaller.createWindowsInstaller(cfg)
  .then(function () {
    console.log(path.join(cfg.outputDirectory, cfg.setupExe))
  }).catch(function (e) {
    console.error(e.message)
  })
