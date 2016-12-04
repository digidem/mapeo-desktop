var exec = require('npm-execspawn')

var child = exec('cd node_modules/leveldown && node-gyp rebuild --target=1.4.10 --runtime=electron --arch=x64 --dist-url=https://atom.io/download/atom-shell', { env: { HOME: '~/.electron-gyp' } })
child.stderr.pipe(process.stderr)
child.stdout.pipe(process.stdout)

