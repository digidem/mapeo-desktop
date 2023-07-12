// @ts-check
import * as React from 'react'
import { makeStyles, Paper, Typography } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import buildConfig from '../../../build-config'

const m = defineMessages({
  // Used to indicate the version of mapeo the user is using
  version: 'Version',
  // Title for the About Mapeo Page
  aboutMapeo: 'About Mapeo',
  // Used to indicate the variant of mapeo the user is using
  variant: 'Variant'
})

export const AboutMapeo = () => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  return (
    <Paper
      style={{
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <Paper className={classes.banner}>
        <Typography variant='h5'>{t(m.aboutMapeo)}</Typography>
      </Paper>
      <div style={{ padding: 20, backgroundColor: '#f6f6f6', height: '100%' }}>
        <div className={classes.listItem}>
          <Typography style={{ fontWeight: 500 }}>
            {t(m.version) + ':'} &nbsp;
          </Typography>
          <Typography>{buildConfig.version}</Typography>
        </div>
        <div className={classes.listItem}>
          <Typography style={{ fontWeight: 500 }}>
            {t(m.variant) + ':'} &nbsp;
          </Typography>
          <Typography>{buildConfig.variant}</Typography>
        </div>
      </div>
    </Paper>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    height: '100'
  },
  banner: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 20
  }
})
