const path = require('path')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  entry: './src/renderer/app.js',
  target: 'electron-renderer',
  externals: [
    'electron-store',
    'winston',
    'winston-daily-rotate-file',
    '@bugsnag/node'
  ],
  // plugins: [new LiveReloadPlugin()],
  // plugins: [new BundleAnalyzerPlugin()],
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'static'),
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader'
      }
    ]
  }
}
