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

const getWifiConnectionColor = (connection) => {
  if (!connection) return '#888'
  if (connection.quality < 30) return 'red'
  if (connection.quality < 60) return 'orange'
}

const m = defineMessages({
  // Title of sync screen
  title: 'Available Devices',
  disconnected: 'Disconnected',
  disconnectedTooltip:
    'You first need to connect to a WiFi network before being able to synchronize devices',
  quality: 'Quality: {quality}%',
  // Button to sync from an existing sync file
  selectSyncfile: 'Sync from a file…',
  // Button to create a new sync file
  newSyncfile: 'Create new syncfile…'
})
const SyncAppBar = ({ onClickSelectSyncfile, onClickNewSyncfile }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  const [currentConnection, setCurrentConnection] = useState(null)

  // Check connection every 2 seconds
  useEffect(() => {
    const intervalCheck = setInterval(() => {
      wifi.getCurrentConnections().then((conn) => setCurrentConnection(conn && conn[0]))
    }, 2000)
    return () => clearInterval(intervalCheck)
  }, [])

  return (
    <AppBar position='static' color='default' elevation={0} className={cx.root}>
      <Toolbar>
        <div className={cx.titleBar}>
          <Typography variant='h6' component='h1' className={cx.title}>
            {t(m.title)}
          </Typography>
          {currentConnection ? (
            <Tooltip
              title={t(m.quality, {
                quality: Math.min(100, currentConnection.quality).toFixed(0)
              })}
            >
              <span className={cx.wifi}>
                <Wifi
                  className={cx.wifiIcon}
                  style={{ color: getWifiConnectionColor(currentConnection) }}
                />
                <Typography variant='overline' component='span' className={cx.wifiName}>
                  {currentConnection.ssid}
                </Typography>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={t(m.disconnectedTooltip)}>
              <span className={cx.wifi}>
                <WifiOff className={cx.wifiIcon} />
                <Typography variant='overline' component='span' className={cx.wifiName}>
                  {t(m.disconnected)}
                </Typography>
              </span>
            </Tooltip>
          )}
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
