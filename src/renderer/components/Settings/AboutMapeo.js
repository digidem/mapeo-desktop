// @ts-check
import * as React from 'react'
import { makeStyles, Typography } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import buildConfig from '../../../build-config'

const m = defineMessages({
  // Used to indicate the version of mapeo the user is using
  version: 'Version'
})

export const AboutMapeo = () => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  return (
    <div className={classes.container}>
      <Typography>{t(m.version) + ': ' + buildConfig.version}</Typography>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    padding: 40
  }
})
