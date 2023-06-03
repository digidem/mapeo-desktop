// @ts-check
import { makeStyles, Typography } from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  // indicates that user in practice mode
  practiceMode: 'Practice Mode'
})

export const PracticeModeBar = () => {
  const classes = useStyles()

  const { formatMessage: t } = useIntl()
  return (
    <div className={classes.container}>
      <Typography>{t(m.practiceMode)}</Typography>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#E86826',
    color: '#FFFFFF'
  }
})
