// @ts-check
import * as React from 'react'
import { Button, makeStyles, Typography } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import { defineMessages, useIntl } from 'react-intl'
import { useMapServerMutation } from '../../hooks/useMapServerMutation'
import { remote } from 'electron'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'

const m = defineMessages({
  // title for screen to delete background map
  deleteMap: 'Delete Map',
  // button to cancel the import of a background map
  cancel: 'Cancel',
  // title of message asking user if the want to delete map
  deleteConfirmationTitle: 'Are you sure you want to delete {mapTitle}',
  // message confirming that user wants to delete map
  deleteConfirmationMessage:
    'This area will no longer be available offline. Cannot be undone. ',
  // Title for import errot pop up dialog,
  deleteErrorTitle: 'Background Maps Delete Error',
  // Description of map import error
  deleteErrorDescription:
    'There was an error deleting the background maps. Please try again.'
})

/**
 * @typedef DeleteMapStyleDialogProps
 * @prop {boolean} open
 * @prop {()=>void} close
 * @prop {string|undefined} name
 * @prop {string} id
 * @prop {()=>void} unsetMapValue
 */

/** @param {DeleteMapStyleDialogProps} deleteMapStyleDialogProps */
export const DeleteMapStyleDialog = ({
  open,
  close,
  name,
  id,
  unsetMapValue
}) => {
  const { formatMessage: t } = useIntl()
  const mutation = useMapServerMutation('delete', `/styles/${id}`)

  const classes = useStyles()

  async function deleteMapStyle () {
    mutation
      .mutateAsync(undefined)
      .then(() => unsetMapValue())
      .catch(err => onError(err))

    function onError (err) {
      remote.dialog.showErrorBox(
        t(m.deleteErrorTitle),
        t(m.deleteErrorDescription) + ': ' + err
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      disableBackdropClick={true}
      fullWidth={true}
    >
      <DialogTitle disableTypography className={classes.spaceBetweenContainer}>
        <Typography variant='body1' className={classes.title}>
          {t(m.deleteMap)}
        </Typography>
        <IconButton onClick={close}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.subtitle} variant='body1'>
          {t(m.deleteConfirmationTitle, { mapTitle: name || '' })}
        </Typography>
        <Typography className={classes.message} variant='body1'>
          {t(m.deleteConfirmationMessage)}
        </Typography>
      </DialogContent>
      <DialogActions className={classes.spaceBetweenContainer}>
        <Button
          style={{ textTransform: 'none', color: '#D92222' }}
          onClick={deleteMapStyle}
        >
          {t(m.deleteMap)}
        </Button>
        <Button
          variant='contained'
          style={{ textTransform: 'none' }}
          onClick={close}
        >
          {t(m.cancel)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const useStyles = makeStyles({
  spaceBetweenContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 24,
    fontWeight: 500
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 500
  },
  message: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20
  }
})
