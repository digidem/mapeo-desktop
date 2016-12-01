var mkdirp = require('mkdirp').sync
var path = require('path')
var electronInstaller = require('electron-winstaller')

var distFolder = path.join(__dirname, '..', 'dist')
var installerFolder = path.join(distFolder, 'installer-win-x64')

function createConfiguration () {
  var pkg = require(path.join('..', 'package.json'))
  var buildFolder = path.join(distFolder, 'Mapeo-win32-x64')

  return {
    appDirectory: buildFolder,
    outputDirectory: installerFolder,

    usePackageJson: false,

    description: pkg.productDescription,
    authors: pkg.author,
    name: 'Mapeo',
    exe: 'Mapeo.exe',
    setupExe: 'Installar_Mapeo_' + pkg.version + '_Windows.exe',
    iconUrl: 'https://raw.githubusercontent.com/digidem/mapeo-desktop/master/static/mapeo.ico',
    version: pkg.version,
    title: 'mapeo'
  }
}

mkdirp(installerFolder)

var config = createConfiguration()
electronInstaller.createWindowsInstaller(config)
  .then(function () {
    console.log(installerFolder)
  }).catch(function (e) {
    console.error(e.message)
  })
