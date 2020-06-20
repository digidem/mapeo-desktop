import React, { useEffect, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { Wifi, WifiOff } from '@material-ui/icons'
import { defineMessages, useIntl } from 'react-intl'
import { Tooltip } from '@material-ui/core'

import logger from '../../../logger'
import electron from '../../electron-ipc'

const getQualityStyle = (connection) => {
  if (connection.quality < 30) return { color: 'white', backgroundColor: 'red' }
  if (connection.quality < 60) return { color: 'white', backgroundColor: 'orange' }
  return { backgroundColor: '#E0E0E0' }
}

const getWifiConnectionMessage = (connection) => {
  if (connection.quality < 30) return m.qualityTooltipPoor
  if (connection.quality < 60) return m.qualityTooltipWeak
  return m.qualityTooltipAdequate
}

const m = defineMessages({
  // Title of sync screen
  title: 'Available Devices',
  disconnected: 'Disconnected',
  disconnectedTooltip:
    'You first need to connect to a WiFi network before being able to synchronize devices',
  wifiError: 'Unknown',
  wifiErrorTooltip: 'Your WiFi card or Operating System (OS) has not been recognized',
  qualityTooltipPoor:
    'The connection signal is very poor. Try getting closer to the WiFi router',
  qualityTooltipWeak:
    'The connection signal is weak. The synchronization might take a longer time to complete',
  qualityTooltipAdequate: 'The connection signal is excellent',
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
  const [wifiError, setWifiError] = useState(false)

  // Check connection every 2 seconds
  useEffect(() => {
    const updateWifi = (err, conn) => {
      if (err || !conn) {
        logger.debug('Wifi error', err, conn)
        setWifiError(true)
        setCurrentConnection(null)
      } else {
        setCurrentConnection(conn)
      }
    }
    const wifiListener = electron.addWifiStatusListener(updateWifi)
    return () => {
      if (wifiListener) wifiListener.remove()
    }
  }, [])

  return (
    <AppBar position='static' color='default' elevation={0} className={cx.root}>
      <Toolbar>
        <div className={cx.titleBar}>
          <Typography variant='h6' component='h1' className={cx.title}>
            {t(m.title)}
          </Typography>

          {currentConnection ? (
            <Tooltip title={t(getWifiConnectionMessage(currentConnection))}>
              <span className={cx.wifi}>
                <Wifi className={cx.wifiIcon} />
                <Typography variant='overline' component='span' className={cx.wifiName}>
                  {currentConnection.ssid}
                </Typography>
                <Typography
                  variant='overline'
                  component='span'
                  className={cx.wifiQuality}
                  style={getQualityStyle(currentConnection)}
                >
                  {t(m.quality, {
                    quality: Math.min(100, currentConnection.quality).toFixed(0)
                  })}
                </Typography>
              </span>
            </Tooltip>
          ) : !wifiError ? (
            <Tooltip title={t(m.disconnectedTooltip)}>
              <span className={cx.wifi}>
                <WifiOff className={cx.wifiIcon} />
                <Typography variant='overline' component='span' className={cx.wifiName}>
                  {t(m.disconnected)}
                </Typography>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={t(m.wifiErrorTooltip)}>
              <span className={cx.wifi}>
                <WifiOff className={cx.wifiIcon} />
                <Typography variant='overline' component='span' className={cx.wifiName}>
                  {t(m.wifiError)}
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
  wifiQuality: {
    lineHeight: 1.2,
    marginLeft: 5,
    fontWeight: 500,
    padding: '1px 5px',
    borderRadius: 1000
  },
  actionArea: {},
  button: {
    marginLeft: theme.spacing(2),
    textTransform: 'none'
  }
}))
