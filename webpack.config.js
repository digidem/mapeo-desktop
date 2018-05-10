const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/app.js',
  target: 'electron',
  externals: [nodeExternals()],
  output: {
    filename: 'static/build.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'eval',
  node: {
    __dirname: true
  },
  module: {
    rules: [
      {
        include: `${__dirname}/src`,
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  }
}
