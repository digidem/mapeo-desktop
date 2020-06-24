const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    /**
     * Set NODE_ENV to "production" for external dependencies
     *
     * NB: React will throw an error in the console if dev tools are installed
     * because we haven't done dead code elimination. This is still better than
     * running the development version of React (which is slow). This is needed
     * because our webpack config targets `electron-renderer`, which loads react
     * as an external module. As a result react will run in development mode
     * unless the runtime variable process.env.NODE_ENV is set to `production`
     */
    new webpack.BannerPlugin({
      banner: 'process.env.NODE_ENV="production";',
      raw: true,
      entryOnly: true,
      test: /\.js$/
    })
  ]
})
