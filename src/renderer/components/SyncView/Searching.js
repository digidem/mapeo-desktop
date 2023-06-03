import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl } from 'react-intl'
import Typography from '@material-ui/core/Typography'

import Loader from '../Loader'

const m = defineMessages({
  // Title on sync screen when searching for devices
  searchingTitle: {
    id: 'renderer.components.SyncView.Searching.searchingTitle',
    defaultMessage: 'Searching…'
  },
  // Hint on sync screen when searching on wifi for devices
  searchingHint: {
    id: 'renderer.components.SyncView.Searching.searchingHint',
    defaultMessage:
      'Make sure devices are turned on and connected to the same wifi network'
  }
})

const Searching = () => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  return (
    <div className={cx.searchingWrapper}>
      <div className={cx.searching}>
        <Loader />
        <div className={cx.searchingText}>
          <Typography gutterBottom variant='h2' className={cx.searchingTitle}>
            {t(m.searchingTitle)}
          </Typography>

          <Typography>{t(m.searchingHint)}</Typography>
        </div>
      </div>
    </div>
  )
}

export default Searching

const useStyles = makeStyles(theme => ({
  searchingText: {
    maxWidth: 300,
    marginLeft: theme.spacing(2)
  },
  searchingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'stretch',
    justifySelf: 'stretch'
  },
  searching: {
    color: '#00052b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  searchingTitle: {
    fontSize: '2em',
    fontWeight: 400
  }
}))
