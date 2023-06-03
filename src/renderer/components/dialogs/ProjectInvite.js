// @ts-check
import * as React from 'react'

import { defineMessages, useIntl } from 'react-intl'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button, makeStyles, Typography } from '@material-ui/core'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import { CopyToClipboard } from '../CopyToClipboard'
import QRCode from 'react-qr-code'
import Divider from '@material-ui/core/Divider'
import { SettingsContext } from '../Settings/SettingsContext'

const m = defineMessages({
  // Title of modal asking user to confirm that they are leaving practice mode
  titleLeavePractice: 'Leave Practice Mode',
  // Title of join project modal
  titleJoinProject: 'Join Project',
  // Title of modal confirming that the user was successfully invited to project
  titleProjectJoined: "You've Been Invited",
  // Asks user to confirm if the would like to bring their observations from practice mode
  bringObservations: 'Bring observations from Practice Mode to the project',
  // Confirmation that user would like to keep observations when joining a new project
  keepObservations: 'Yes, keep my observations',
  // Confirmation that user would like to discard observations when joining a new project
  deleteObservations: 'No, delete my observations',
  // button text to cancel action
  cancel: 'Cancel',
  // instructions for user to show qr code to the project admin
  showQr: 'Show this QR code to a Project Coordinator',
  // alternative instructions for user send a join request instead of using the QR code
  sendJoinRequest: 'Or Send Join Request',
  // instructions for user to send a join request
  copyUrl: 'Copy the url and send it to the Project Coordinator',
  // button text to close dialog,
  close: 'Close'
})

/**
 * @typedef ProjectInviteDialogProps
 * @prop {boolean} isOpen
 * @prop {function(boolean?):void} toggleOpenClose
 */

/** @param {ProjectInviteDialogProps} props */
export const ProjectInviteDialog = ({ isOpen, toggleOpenClose }) => {
  return (
    <Dialog open={isOpen}>
      <CustomDialogContent closeDialog={() => toggleOpenClose(false)} />
    </Dialog>
  )
}

/**
 * @typedef CustomDialogContentProps
 * @prop {function():void} closeDialog
 */

/** @param {CustomDialogContentProps} props */
const CustomDialogContent = ({ closeDialog }) => {
  const { formatMessage: t } = useIntl()

  const { practiceModeOn } = React.useContext(SettingsContext)

  /** @type {[boolean|null, function]} */
  const [migrateObservations, setMigrateObservations] = React.useState(null)

  const [migrationPlanConfirmed, setMigrationPlanConfirmed] = React.useState(
    false
  )

  const classes = useStyles()

  if (practiceModeOn && !migrationPlanConfirmed) {
    return (
      <React.Fragment>
        <DialogTitle>{t(m.titleLeavePractice)}</DialogTitle>
        <DialogContent>
          <Typography style={{ marginBottom: 20 }}>
            {t(m.bringObservations)}
          </Typography>
          <FormControl style={{ marginBottom: 200 }} component='fieldset'>
            <RadioGroup value={migrateObservations}>
              <FormControlLabel
                value={true}
                control={<Radio />}
                label={t(m.bringObservations)}
                onClick={() => {
                  setMigrateObservations(true)
                }}
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label={t(m.deleteObservations)}
                onClick={() => {
                  setMigrateObservations(false)
                }}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: 20
          }}
        >
          <Button
            style={{ textTransform: 'none', color: '#0066FF' }}
            onClick={() => closeDialog()}
          >
            {t(m.cancel)}
          </Button>
          <Button
            disabled={migrateObservations === null}
            style={{
              textTransform: 'none',
              backgroundColor:
                migrateObservations === null ? '#ECECEC' : '#0066FF',
              color: 'white'
            }}
            variant='contained'
            onClick={() => setMigrationPlanConfirmed(true)}
          >
            {t(m.titleLeavePractice)}
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <DialogTitle style={{ paddingLeft: 40 }}>
        {t(m.titleJoinProject)}
      </DialogTitle>
      <Divider style={{ marginBottom: 20 }} variant='middle' />
      <DialogContent className={classes.container}>
        {/* @ts-ignore */}
        <QRCode
          size={200}
          className={classes.qr}
          value={'https://add-project-invite-here'}
        />
        <Typography className={classes.text}>{t(m.showQr)}</Typography>
        <Divider style={{ marginBottom: 20, flexBasis: '100%' }} />
        <Typography
          className={classes.text}
          style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}
        >
          {t(m.sendJoinRequest)}
        </Typography>
        <CopyToClipboard textToCopy='https://add-project-invite-here' />
        <Typography style={{ marginTop: 20 }}>{t(m.copyUrl)}</Typography>
      </DialogContent>
      <Divider style={{ marginTop: 20, marginBottom: 20 }} variant='middle' />
      <DialogActions style={{ paddingRight: 40, paddingBottom: 20 }}>
        <Button
          style={{ textTransform: 'none' }}
          variant='contained'
          onClick={() => closeDialog()}
        >
          {t(m.close)}
        </Button>
      </DialogActions>
    </React.Fragment>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qr: {
    marginBottom: 20
  },
  text: {
    marginBottom: 20,
    flexBasis: '100%',
    textAlign: 'center'
  }
})
