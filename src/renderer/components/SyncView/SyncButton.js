import React from 'react'
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
  retry: 'Retry'
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

const ProgressIcon = ({ progress }) => (
  <ProgressBackground>
    <CircularProgress
      variant={progress ? 'static' : 'indeterminate'}
      disableShrink
      value={progress}
      color='inherit'
      size={32}
      thickness={5}
    />
  </ProgressBackground>
)

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

const SyncButton = ({ progress, onClick, variant = 'ready' }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()
  switch (variant) {
    case 'ready':
    case 'error':
      return (
        <StyledButton onClick={onClick}>
          {variant === 'ready' ? t(m.sync) : t(m.retry)}
          <SyncIcon className={classes.icon} />
        </StyledButton>
      )
    case 'progress':
      return (
        <StyledButton disabled onClick={onClick} className={classes.progress}>
          {progress ? progress.toFixed(0) + '%' : t(m.starting)}
          <ProgressIcon progress={progress} className={classes.icon} />
        </StyledButton>
      )

    case 'complete':
      return (
        <StyledButton onClick={onClick}>
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
  }
}))
