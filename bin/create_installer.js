var electronInstaller = require('electron-winstaller')
var mkdirp = require('mkdirp').sync
var rimraf = require('rimraf').sync
var path = require('path')

var distFolder = path.join(__dirname, '..', 'dist')
var buildFolder = path.join(distFolder, 'Mapeo-win32-x64')
var installerFolder = path.join(distFolder, 'installer-win-x64')

rimraf(installerFolder)
mkdirp(installerFolder)

electronInstaller.createWindowsInstaller({
  appDirectory: buildFolder,
  outputDirectory: installerFolder,
  description: 'Offline Map Editor',
  authors: 'Digital Democracy',
  name: 'Mapeo',
  exe: 'Mapeo.exe',
  setupExe: 'InstallarMapeo.exe',
  iconUrl: 'https://raw.githubusercontent.com/digidem/mapeo-desktop/master/static/mapeo.ico',
  version: '1.2.3-fake',
  title: 'mapeo',
  usePackageJson: false
}).then(function () {
  console.log('It worked!')
}).catch(function (e) {
  console.error(`No dice: ${e.message}`)
})
