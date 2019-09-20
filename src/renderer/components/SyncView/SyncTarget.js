import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PhoneIcon from '@material-ui/icons/PhoneAndroid'
import LaptopIcon from '@material-ui/icons/Laptop'
import ErrorIcon from '@material-ui/icons/Error'
import Paper from '@material-ui/core/Paper'
import { Typography } from '@material-ui/core'
import SyncButton from './SyncButton'
import DateDistance from '../DateDistance'
import { defineMessages, useIntl } from 'react-intl'

export const peerStatus = {
  READY: 'ready',
  PROGRESS: 'progress',
  ERROR: 'error',
  COMPLETE: 'complete'
}

const m = defineMessages({
  // Message shown when there is an error while syncing
  errorMsg: 'Syncronization Error',
  // Shown before last sync time, e.g. 'Last synchronized: 2 hours ago'
  lastSync: 'Last synchronized:'
})

const SyncTargetView = ({
  // Unique identifier for the peer
  id,
  // User friendly peer name
  name = 'Android Phone',
  // See above peerStatus
  status,
  // Sync progress, between 0 to 1
  progress,
  // The time of last completed sync in milliseconds since UNIX Epoch
  lastCompleted,
  errorMsg,
  // "mobile" or "desktop"
  deviceType,
  onClick
}) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  return (
    <Paper className={cx.root}>
      <div className={cx.wrapper}>
        <div className={cx.content}>
          {status === 'error' ? (
            <ErrorIcon
              fontSize='inherit'
              className={cx.icon}
              style={{ color: 'red' }}
            />
          ) : deviceType === 'desktop' ? (
            <LaptopIcon fontSize='inherit' className={cx.icon} />
          ) : (
            <PhoneIcon fontSize='inherit' className={cx.icon} />
          )}
          <Typography variant='h5' component='h2'>
            {status === 'error' ? t(m.errorMsg) : name}
          </Typography>
          {lastCompleted && (
            <Typography className={cx.lastSync}>
              {t(m.lastSync)}
              <br />
              <DateDistance date={lastCompleted} />
            </Typography>
          )}
        </div>
        <SyncButton onClick={onClick} variant={status} progress={progress} />
      </div>
    </Paper>
  )
}

export default SyncTargetView

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '100%',
    position: 'relative'
  },
  icon: {
    marginBottom: theme.spacing(2),
    fontSize: 48
  },
  lastSync: {
    textAlign: 'center',
    fontStyle: 'italic'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: '10%'
  }
}))
