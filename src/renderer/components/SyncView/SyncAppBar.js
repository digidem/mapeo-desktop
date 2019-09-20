import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  // Title of sync screen
  title: 'Available Devices',
  subtitle: 'via Wi-Fi',
  // Button to sync from an existing sync file
  selectSyncfile: 'Sync from a file…',
  // Button to create a new sync file
  newSyncfile: 'Create new syncfile…'
})
const SyncAppBar = ({ onClickSelectSyncfile, onClickNewSyncfile }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  return (
    <AppBar position='static' color='default' elevation={0} className={cx.root}>
      <Toolbar>
        <Typography variant='h6' component='h1' className={cx.title}>
          {t(m.title)}
          <span className={cx.subtitle}>{' ' + t(m.subtitle)}</span>
        </Typography>
        <Button
          onClick={onClickSelectSyncfile}
          color='inherit'
          variant='outlined'
          className={cx.button}
        >
          {t(m.selectSyncfile)}
        </Button>
        <Button
          onClick={onClickNewSyncfile}
          color='inherit'
          variant='outlined'
          className={cx.button}
        >
          {t(m.newSyncfile)}
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default SyncAppBar

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'white'
  },
  title: {
    flex: 1
  },
  subtitle: {
    fontWeight: 300
  },
  actionArea: {},
  button: {
    marginLeft: theme.spacing(2),
    textTransform: 'none'
  }
}))
