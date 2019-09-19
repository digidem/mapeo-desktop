import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DoneIcon from '@material-ui/icons/Check'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'

const SyncIcon = props => <FontAwesomeIcon icon={faBolt} {...props} />

const ProgressIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #c1c1c1;
  align-items: center;
  justify-content: center;
  display: flex;
`

const ProgressIcon = ({ progress }) => (
  <ProgressIconWrapper>
    <CircularProgress
      variant='static'
      disableShrink
      value={progress}
      color='inherit'
      size={32}
      thickness={5}
    />
  </ProgressIconWrapper>
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
  switch (variant) {
    case 'ready':
      return (
        <StyledButton onClick={onClick}>
          Sincronizar
          <SyncIcon className={classes.icon} />
        </StyledButton>
      )
    case 'progress':
      return (
        <StyledButton disabled onClick={onClick} className={classes.progress}>
          {(progress || 0).toFixed(0) + '%'}
          <ProgressIcon progress={progress} className={classes.icon} />
        </StyledButton>
      )

    case 'complete':
      return (
        <StyledButton onClick={onClick}>
          Completo
          <DoneIcon className={classes.icon} />
        </StyledButton>
      )
  }
}

export default SyncButton

const useStyles = makeStyles(theme => ({
  icon: {
    marginLeft: theme.spacing(1)
  },
  button: {
    minHeight: 48,
    minWidth: 200,
    justifyContent: 'space-between'
  },
  progress: {
    fontWeight: 600
  }
}))
