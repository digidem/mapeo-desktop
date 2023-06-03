import React from 'react'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, FormattedMessage } from 'react-intl'

const msgs = defineMessages({
  // Title for observations export dialog
  title: {
    id: 'renderer.components.MapFilter.DataExportDialog.Template.title',
    defaultMessage: 'Export Observations'
  }
})

export const Template = ({ actions, content }) => {
  const classes = useStyles()
  return (
    <>
      <DialogTitle id='responsive-dialog-title' className={classes.title}>
        <FormattedMessage {...msgs.title} />
      </DialogTitle>
      <DialogContent className={classes.content}>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </>
  )
}

const useStyles = makeStyles(theme => ({
  title: {
    flex: 1,
    paddingBottom: 8
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0
  }
}))
