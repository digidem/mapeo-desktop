require('dotenv').config()
const { notarize } = require('electron-notarize')
const { log } = require('builder-util')

exports.default = async function notarizing (context) {
  const {
    electronPlatformName,
    appOutDir,
    packager: { appInfo }
  } = context
  const { APPLE_ID, APPLE_ID_PASSWORD } = process.env

  if (electronPlatformName !== 'darwin') {
    return
  }

  if (!APPLE_ID || !APPLE_ID_PASSWORD) {
    log.warn(
      'Missing APPLE_ID and/or APPLE_ID_PASSWORD in environment, skipping notarizing'
    )
    return
  }

  const notarizeConfig = {
    appBundleId: appInfo.macBundleIdentifier,
    appPath: `${appOutDir}/${appInfo.productFilename}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_ID_PASSWORD
  }

  log.info({ ...notarizeConfig, appleIdPassword: '*****' }, 'notarizing')

  return notarize(notarizeConfig)
}
