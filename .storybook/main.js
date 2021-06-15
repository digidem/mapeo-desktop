const path = require('path')

module.exports = {
  webpackFinal: async (config, { configType }) => {
    // Configure worker-loader for PDF renderer
    config.module.rules.unshift({
      test: /\.worker\.js$/,
      include: path.join(__dirname, '../src'),
      use: [{ loader: 'worker-loader' }, { loader: 'babel-loader' }]
    })

    // Return the altered config
    return config
  }
}
