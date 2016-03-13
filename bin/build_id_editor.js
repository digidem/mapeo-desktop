var fs = require('fs')
var path = require('path')

var src = fs.createReadStream(path.join(__dirname, '../node_modules/iD/dist/iD.js'))
var dst = fs.createWriteStream(path.join(__dirname, '../public/ideditor.js'))

src.push('module=undefined;require=undefined;')

src.pipe(dst)
