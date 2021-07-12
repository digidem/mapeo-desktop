/* eslint-disable no-template-curly-in-string */
const path = require('path')

module.exports = async function (config) {
  const productName = 'Mapeo for ICCAs'
  return {
    ...config,
    productName,
    appId: 'org.digital-democracy.mapeo-desktop.icca',
    artifactName: 'Mapeo_ICCAs_v${version}_${os}.${ext}',
    win: {
      ...config.win,
      artifactName: 'Mapeo_ICCAs_v${version}_${os}-${env.ARCH}.${ext}'
    },
    extraMetadata: {
      name: 'mapeo-icca',
      productName,
      variant: 'icca'
    },
    publish: [
      {
        provider: 's3',
        bucket: 'downloads.mapeo.app',
        path:
          process.env.ARCH === 'ia32' ? '/desktop-icca/ia32' : '/desktop-icca'
      }
    ],
    directories: {
      ...config.directories,
      buildResources: path.join(__dirname, 'build'),
      output: 'dist/icca'
    },
    extraResources: [
      {
        // TODO: Update mapeo-config-icca package to define package.main
        // so that we can use require.resolve() here
        from: path.join(__dirname, '../../node_modules/mapeo-config-icca/dist'),
        to: 'presets/default'
      }
    ]
  }
}
