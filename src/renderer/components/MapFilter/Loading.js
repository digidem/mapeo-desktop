import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl } from 'react-intl'
import { Typography } from '@material-ui/core'

import Loader from '../Loader'

const m = defineMessages({
  // Displayed whilst observations and presets load
  loading: 'Loading…'
})

const Searching = () => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  return (
    <div className={cx.root}>
      <div className={cx.container}>
        <Loader />
        <div className={cx.text}>
          <Typography gutterBottom variant='h2' className={cx.loadingTitle}>
            {t(m.loading)}
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default Searching

const useStyles = makeStyles(theme => ({
  text: {
    maxWidth: 300,
    marginLeft: theme.spacing(2)
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'stretch',
    justifySelf: 'stretch'
  },
  container: {
    color: '#00052b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  loadingTitle: {
    fontSize: '2em',
    fontWeight: 400
  }
}))
