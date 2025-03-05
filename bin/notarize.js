require('dotenv').config()
const { notarize } = require('@electron/notarize')
const { log } = require('builder-util')

exports.default = async function notarizing (context) {
  const {
    electronPlatformName,
    appOutDir,
    packager: { appInfo }
  } = context
  const { APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID } = process.env

  if (electronPlatformName !== 'darwin') {
    return
  }

  if (!APPLE_ID || !APPLE_ID_PASSWORD || !APPLE_TEAM_ID) {
    log.warn(
      'Missing APPLE_ID and/or APPLE_ID_PASSWORD in environment, skipping notarizing'
    )
    return
  }

  const notarizeConfig = {
    appPath: `${appOutDir}/${appInfo.productFilename}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_ID_PASSWORD,
    teamId: APPLE_TEAM_ID
  }

  log.info(
    { ...notarizeConfig, appleIdPassword: '*****', teamId: '*****' },
    'notarizing'
  )

  return notarize(notarizeConfig)
}
