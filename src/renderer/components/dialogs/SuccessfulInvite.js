// @ts-check
import * as React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import { defineMessages, useIntl } from 'react-intl'
import Divider from '@material-ui/core/Divider'

const m = defineMessages({
  // Title for successful invite dialog
  youvebeenInvited: "You've Been Invited",
  joinProject: 'Join Project',
  declineInvite: 'Decline Invite',
  joinAndSync: 'Join and Sync'
})

/**
 * @typedef SuccessfulInviteProps
 * @prop {boolean} open
 * @prop {() => void} closeAndResetInvite
 * @prop {string} invite
 */

/** @param {SuccessfulInviteProps} props */
export const SuccessfulInvite = ({ open, closeAndResetInvite, invite }) => {
  const { formatMessage: t } = useIntl()

  const classes = useStyles()

  function joinProject () {
    // TODO: join project with invite
    closeAndResetInvite()
  }

  return (
    <Dialog open={open}>
      <DialogTitle>{t(m.youvebeenInvited)}</DialogTitle>
      <Divider style={{ marginBottom: 10 }} variant='middle' />
      <DialogContent className={classes.content}>
        <Avatar className={classes.avatar}>
          <PersonAddIcon />
        </Avatar>
        <Typography
          style={{ marginBottom: 10, fontSize: 24, fontWeight: 'bold' }}
          className={classes.text}
        >
          {t(m.youvebeenInvited)}
        </Typography>
        <Typography style={{ marginBottom: 40 }} className={classes.text}>
          {t(m.joinProject) + ': ' + invite}
        </Typography>
      </DialogContent>
      <DialogActions
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 20
        }}
      >
        <Button
          style={{ textTransform: 'none', color: '#0066FF' }}
          onClick={closeAndResetInvite}
        >
          {t(m.declineInvite)}
        </Button>
        <Button
          style={{
            textTransform: 'none',
            backgroundColor: '#0066FF',
            color: 'white'
          }}
          variant='contained'
          onClick={joinProject}
        >
          {t(m.joinAndSync)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const useStyles = makeStyles({
  avatar: {
    backgroundColor: '#fff',
    color: '#000',
    boxShadow: '1px 1px 2px',
    marginBottom: 20
  },
  content: {
    width: 500,
    height: 300,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    width: '100%',
    textAlign: 'center',
    margin: 0
  }
})
