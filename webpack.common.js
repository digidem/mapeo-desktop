const path = require('path')

module.exports = {
  entry: './src/renderer/app.js',
  target: 'electron-renderer',
  externals: [
    'winston',
    'winston-daily-rotate-file',
    '@bugsnag/node',
    '@bugsnag/browser',
    'ajv',
    'electron-debug',
    'mime-db'
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
