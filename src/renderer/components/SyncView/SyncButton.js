import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DoneIcon from '@material-ui/icons/Check'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { useIntl, defineMessages } from 'react-intl'

const m = defineMessages({
  // Button to sync a device
  sync: 'Synchronize',
  // Displayed when sync is starting
  starting: 'Starting…',
  // Button when sync is complete
  complete: 'Complete',
  // Button to retry sync after error
  retry: 'Retry',
  // Disconnected
  disconnected: 'Disconnected',
  // Almost done! But progress is inaccurate.
  finishing: 'Finishing…'
})

const SyncIcon = props => <FontAwesomeIcon icon={faBolt} {...props} />

const ProgressBackground = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  margin-left: 16px;
  background-color: #c1c1c1;
  align-items: center;
  justify-content: center;
  display: flex;
`

const ProgressIcon = ({ progress }) => {
  const [awaitingCompletion, setAwaitingCompletion] = useState(false)
  const cx = useStyles()
  // After 3 seconds of being frozen at 100%, show an indeterminate spinner -->
  // give the user something to hope for (it should complete eventually)
  useEffect(
    () => {
      if (Math.round(progress * 100) < 100) return
      const timeoutId = setTimeout(() => setAwaitingCompletion(true), 3000)
      return () => clearTimeout(timeoutId)
    },
    [progress]
  )

  return (
    <ProgressBackground>
      <CircularProgress
        variant={progress && !awaitingCompletion ? 'static' : 'indeterminate'}
        value={progress * 100}
        color='inherit'
        size={32}
        thickness={5}
        className={cx.progressCircle}
      />
    </ProgressBackground>
  )
}

const StyledButton = ({ className, ...props }) => {
  const classes = useStyles()
  return (
    <Button
      variant='contained'
      size='large'
      className={className + ' ' + classes.button}
      color='primary'
      {...props}
    />
  )
}

const SyncButton = ({ progress, connected, onClick, variant = 'ready' }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()
  switch (variant) {
    case 'ready':
    case 'error':
      return (
        <StyledButton disabled={!connected} onClick={onClick}>
          {!connected ? t(m.disconnected)
            : variant === 'ready' ? t(m.sync) : t(m.retry)}
          <SyncIcon className={classes.icon} />
        </StyledButton>
      )
    case 'progress':
      return (
        <StyledButton disabled onClick={onClick} className={classes.progress}>
          {!progress
            ? t(m.starting)
            : progress === 1
              ? t(m.finishing)
              : (progress * 100).toFixed(0) + '%' }
          <ProgressIcon progress={progress} className={classes.icon} />
        </StyledButton>
      )

    case 'complete':
      return (
        <StyledButton disabled={!connected} onClick={onClick}>
          {t(m.complete)}
          <DoneIcon className={classes.icon} />
        </StyledButton>
      )
  }
}

export default SyncButton

const useStyles = makeStyles(theme => ({
  icon: {
    marginLeft: theme.spacing(2)
  },
  button: {
    minHeight: 48,
    justifyContent: 'space-between'
  },
  progress: {
    minWidth: 150,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600
  },
  progressCircle: {
    '& .MuiCircularProgress-circleStatic': {
      transitionDuration: '50ms'
    }
  }
}))
