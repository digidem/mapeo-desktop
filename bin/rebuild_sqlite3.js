var os = require('os')
// var electronVersion = require('./package.json').dependencies.electron
var electronVersion = '1.4.10'
var electronVersionPath = '1.4'
var modulePath = '../lib/binding/electron-v' + electronVersionPath + '-' + os.platform() + '-' + os.arch()
var exec = require('npm-execspawn')

var cmd = 'cd node_modules/sqlite3'
cmd += ' && node-gyp configure --module_name=node_sqlite3 --module_path=' + modulePath
cmd += ' && node-gyp rebuild --target=' + electronVersion + ' --arch=' + os.arch() + ' --target_platform=' + os.platform() + ' --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=' + modulePath

var child = exec(cmd)
child.stderr.pipe(process.stderr)
child.stdout.pipe(process.stdout)

