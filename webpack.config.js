const path = require('path')
const nodeExternals = require('webpack-node-externals')
var LiveReloadPlugin = require('webpack-livereload-plugin')

module.exports = {
  mode: 'development',
  entry: './src/renderer/app.js',
  target: 'electron-renderer',
  externals: [nodeExternals()],
  plugins: [new LiveReloadPlugin()],
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'static'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader'
      }
    ]
  }
}
