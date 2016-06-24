var electronInstaller = require('electron-winstaller')
var mkdirp = require('mkdirp').sync
var path = require('path')

var distFolder = path.join(__dirname, '..', 'dist')
var buildFolder = path.join(distFolder, 'Mapeo-win32-x64')
var installerFolder = path.join(distFolder, 'installer-win-x64')

mkdirp(installerFolder)

electronInstaller.createWindowsInstaller({
  appDirectory: buildFolder,
  outputDirectory: installerFolder,
  description: 'Offline Map Editor',
  authors: 'Digital Democracy',
  exe: 'Mapeo.exe'
}).then(function () {
  console.log('It worked!')
}).catch(function (e) {
  console.error(`No dice: ${e.message}`)
})
