const path = require('path')

module.exports = {
  entry: {
    app: './src/renderer/app.js',
    pdfWorker:
      './src/renderer/components/MapFilter/ReportView/renderReport.worker.js'
  },
  target: 'electron-renderer',
  externals: [
    'winston',
    'winston-daily-rotate-file',
    '@bugsnag/node',
    '@bugsnag/browser',
    'ajv',
    'electron-debug',
    'mime-db',
    '../package.json'
  ],
  // plugins: [new BundleAnalyzerPlugin()],
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
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
      },
      {
        test: /\.ttf$/i,
        loader: 'file-loader'
      },
      {
        test: /\.png$/i,
        loader: 'url-loader'
      }
    ]
  }
}
