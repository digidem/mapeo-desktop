const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/app.js',
  target: 'electron-renderer',
  externals: [nodeExternals()],
  output: {
    filename: 'static/build.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      loader: 'babel-loader',
      query: {
        presets: ['react', 'env'],
        plugins: [
          'transform-object-rest-spread'
        ]
      }
    }]
  }
}
