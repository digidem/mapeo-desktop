// @ts-check
import * as React from 'react'

import { defineMessages, useIntl } from 'react-intl'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Button, Typography } from '@material-ui/core'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

const m = defineMessages({
  // Title of modal asking user to confirm that they are leaving practice mode
  titleLeavePractice: 'Leave Practice Mode',
  // Title of join project modal
  titleJoinProject: 'Join Project',
  // Title of modal confirming that the user was successfully invited to project
  titleProjectJoined: "You've Been Invited",
  // Asks user to confirm if the would like to bring their observations from practice mode
  bringObservations: 'Bring observations from Practice Mode to the project?',
  // Confirmation that user would like to keep observations when joining a new project
  keepObservations: 'Yes, keep my observations',
  // Confirmation that user would like to discard observations when joining a new project
  deleteObservations: 'No, delete my observations'
})

/** @typedef {'leavePractice'|'joinProject'|'invited'} DialogState */

/**
 * @typedef ProjectInviteDialogProps
 * @prop {boolean} isOpen
 * @prop {function():void} toggleOpenClose
 */

/** @param {ProjectInviteDialogProps} props */
export const ProjectInviteDialog = ({ isOpen, toggleOpenClose }) => {
  /** @type {[DialogState, function]} */
  const [dialogState, setDialogState] = React.useState('leavePractice')
  const { formatMessage: t } = useIntl()

  return (
    <Dialog open={isOpen}>
      <CustomDialogContent dialogState={dialogState} />
    </Dialog>
  )
}

/**
 * @typedef CustomDialogContentProps
 * @prop {DialogState} dialogState
 */

/** @param {CustomDialogContentProps} props */
const CustomDialogContent = ({ dialogState }) => {
  const { formatMessage: t } = useIntl()

  /** @type {[boolean|null, function]} */
  const [radioValue, setRadioValue] = React.useState(null)
  if (true) {
    return (
      <React.Fragment>
        <DialogTitle>{t(m.titleLeavePractice)}</DialogTitle>
        <DialogContent>
          <Typography>{t(m.bringObservations)}</Typography>
          <FormControl component='fieldset'>
            <RadioGroup value={radioValue}>
              <FormControlLabel
                value={true}
                control={<Radio />}
                label={t(m.bringObservations)}
                onClick={() => {
                  setRadioValue(true)
                }}
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label={t(m.deleteObservations)}
                onClick={() => {
                  setRadioValue(false)
                }}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
      </React.Fragment>
    )
  }
}
