import React, { useEffect, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { Wifi, WifiOff } from '@material-ui/icons'
import { defineMessages, useIntl } from 'react-intl'
import wifi from 'node-wifi'
import { Tooltip } from '@material-ui/core'

wifi.init({
  iface: null
})

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
  const [currentConnection, setCurrentConnection] = useState(null)

  useEffect(() => {
    wifi
      .getCurrentConnections()
      .then((conn) => conn && setCurrentConnection(conn[0]))
  }, [])
  return (
    <AppBar position='static' color='default' elevation={0} className={cx.root}>
      <Toolbar>
        <div className={cx.titleBar}>
          <Typography variant='h6' component='h1' className={cx.title}>
            {t(m.title)}
          </Typography>
          <span className={cx.wifi}>
            {currentConnection ? (
              <Wifi className={cx.wifiIcon} />
            ) : (
              <WifiOff className={cx.wifiIcon} />
            )}
            {currentConnection && (
              <Typography
                variant='overline'
                component='span'
                className={cx.wifiName}
              >
                {currentConnection.ssid}
              </Typography>
            )}
          </span>
        </div>
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

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'white'
  },
  titleBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  title: {
    lineHeight: 1.2
  },
  wifi: {
    display: 'flex',
    alignItems: 'center'
  },
  wifiIcon: {
    fontSize: '1rem',
    position: 'relative',
    top: -1 // visual alignment
  },
  wifiName: {
    lineHeight: 1.2,
    marginLeft: 5
  },
  actionArea: {},
  button: {
    marginLeft: theme.spacing(2),
    textTransform: 'none'
  }
}))
