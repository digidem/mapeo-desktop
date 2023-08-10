import React from 'react'
import {
  Box,
  Button,
  Paper,
  Slide,
  Typography,
  makeStyles
} from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import { Close } from '@material-ui/icons'

const m = defineMessages({
  // Title for background maps overlay
  title: 'Background Maps',
  // Label for dismiss button
  close: 'Close',
  // Label for link to manage maps
  manageMapsLink: 'Manage Maps'
})

export const BackgroundMapSelector = ({ active, dismiss }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  return (
    <Slide direction='up' in={active} mountOnEnter unmountOnExit>
      <Paper elevation={2} className={classes.container}>
        <Box className={classes.header}>
          <Typography variant='h1' className={classes.title}>
            {t(m.title)}
          </Typography>
          <Button onClick={dismiss} color='primary'>
            {t(m.close)}
            <Close />
          </Button>
        </Box>
      </Paper>
    </Slide>
  )
}

const useStyles = makeStyles(theme => ({
  container: {
    borderRadius: '10px 10px 0px 0px',
    width: '100%',
    height: '50vh',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2
  },
  header: {
    padding: '16px 22px',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    marginRight: 5
  }
}))
