import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import fsWriteStreamAtomic from 'fs-write-stream-atomic'
import path from 'path'
import { remote } from 'electron'
import pump from 'pump'
import logger from '../../../logger'
import createZip from '../../create-zip'

const msgs = defineMessages({
  // Title for ICCA package export dialog
  title: 'Export an ICCA export package',
  // Save button
  save: 'Save',
  // cancel button
  cancel: 'Cancel',
  // Label for field to enter map title
  titleLabel: 'placeholder title',
  // Label for field to enter map description
  descriptionLabel: 'placeholder text field label'
})

const EditDialogContent = ({ onClose }) => {
  const classes = useStyles()
  const { formatMessage } = useIntl()
  const [saving, setSaving] = useState()
  const [title, setTitle] = useState()
  const [description, setDescription] = useState()

  const handleClose = () => {
    setSaving(false)
    setTitle(undefined)
    setDescription(undefined)
    onClose()
  }

  const handleSave = e => {
    e.preventDefault()
    setSaving(true)
    const points = observationsToGeoJson()
    const metadata = { title: title || '', description: description || '' }

    remote.dialog
      .showSaveDialog({
        title: 'ICCA Export Package',
        defaultPath: 'mapeo-icca-export',
        filters: [{ name: 'Mapeo Webmap Package', extensions: ['mapeomap'] }]
      })
      .then(({ filePath, canceled }) => {
        if (canceled) return handleClose()
        const filepathWithExtension = path.join(
          path.dirname(filePath),
          path.basename(filePath, '.mapeomap') + '.mapeomap'
        )
        createArchive(filepathWithExtension, err => {
          if (err) {
            logger.error('MapExportDialog: Failed to create archive', err)
          } else {
            logger.debug('Successfully created map archive')
          }
          handleClose()
        })
      })
      .catch(handleClose)

    function createArchive (filePath, cb) {
      const output = fsWriteStreamAtomic(filePath)

      const localFiles = [
        {
          data: JSON.stringify(points, null, 2),
          metadataPath: 'points.json'
        },
        {
          data: JSON.stringify(metadata, null, 2),
          metadataPath: 'metadata.json'
        }
      ]

      const archive = createZip(localFiles, undefined, { formatMessage })

      pump(archive, output, cb)
    }
  }

  return (
    <form noValidate autoComplete='off'>
      <DialogTitle id='responsive-dialog-title' style={{ paddingBottom: 8 }}>
        <FormattedMessage {...msgs.title} />
      </DialogTitle>

      <DialogContent className={classes.content}>
        <DialogContentText>
          Answer these questions for the ICCA export ok
        </DialogContentText>
        <TextField
          label={formatMessage(msgs.titleLabel)}
          value={title}
          fullWidth
          variant='outlined'
          onChange={e => setTitle(e.target.value)}
          margin='normal'
          disabled={saving}
        />
        <TextField
          label={formatMessage(msgs.descriptionLabel)}
          value={description}
          fullWidth
          rows={3}
          rowsMax={6}
          multiline
          variant='outlined'
          margin='normal'
          disabled={saving}
          onChange={e => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button disabled={saving} onClick={handleClose}>
          {formatMessage(msgs.cancel)}
        </Button>
        <Button
          disabled={saving}
          onClick={handleSave}
          color='primary'
          variant='contained'
          type='submit'
        >
          {formatMessage(msgs.save)}
        </Button>
      </DialogActions>
    </form>
  )
}

export default function ICCAExportDialog ({ onClose, open }) {
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      scroll='body'
      aria-labelledby='responsive-dialog-title'
    >
      {open && (
        <EditDialogContent
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0
  }
}))

function observationsToGeoJson () {
  return {
    type: 'FeatureCollection',
    features: []
  }
}
