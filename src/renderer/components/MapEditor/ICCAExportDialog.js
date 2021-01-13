import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import fsWriteStreamAtomic from 'fs-write-stream-atomic'
import path from 'path'
import { remote } from 'electron'
import pump from 'pump'
import insertCss from 'insert-css'
import logger from '../../../logger'
import createZip from '../../create-zip'
import api from '../../new-api'

const msgs = defineMessages({
  // Title for ICCA package export dialog
  title: 'Export an ICCA export package',
  // Save button
  save: 'Save',
  // cancel button
  cancel: 'Cancel',
  // OK button
  ok: 'OK',
  // Form instructions
  formInstructions: 'Please answer these questions before exporting.',
  // No data to export
  noDataSummary: 'There are no ICCA boundaries to export.',
  noDataInstructions: `
    To draw an ICCA boundary, create an area and tag it with the type
    "ICCA Boundary." Remember to save your changes to the map before
    exporting.`,
  aboutYouSection: 'About you:',
  // Question prompts
  question1Prompt: `
    Has your community or indigenous people collectively consented to the map
    and other information being shared with UNEP-WCMC?`,
  question2Prompt: `
    Do you want the map and other information to be available for anyone to
    view and download?`,
  question3Prompt: `
    Name of the community, indigenous people, or individual providing the
    information`,
  question4Prompt: `
    If you are an individual, what is your relationship to the indigenous
    people or community?`,
  question5Prompt: `
    Email address, phone number or address where we can contact you. We will
    contact you to confirm we have received your information and to discuss
    the information further where needed. We will also contact you periodically
    to make sure the information is up to date.`,
  // Yes/no answers
  answerYes: 'Yes',
  answerNo: 'No',
  // Choices for question 4
  question4Answer1: 'Member of the community/indigenous people',
  question4Answer2: 'Representative or associate of the community/indigenous people',
  question4Answer3: 'Representative of a non-governmental organisation',
  question4Answer4: 'Other',
  // Placeholder for question 5
  question5Placeholder: 'Your contact information',
  // Helper texts
  requiredAnswer: 'This answer is required.',
  atLeastOneAnswer: 'Please fill in at least one field.',
  errorMissingRequired: 'Please fill out all required fields.',
  // Labels for community name
  communityOriginalName: 'Original language',
  communityEnglishName: 'English'
})

// Insert a tiny lil' shake animation when an error occurs
// We don't use the makeStyles api here because it can't handle keyframes
insertCss(`
  @keyframes shakeX {
    from,
    to {
      transform: translate3d(0, 0, 0);
    }

    16.67%,
    50%,
    83.33% {
      transform: translate3d(-10px, 0, 0);
    }

    33.33%,
    66.67% {
      transform: translate3d(10px, 0, 0);
    }
  }

  .shakeX {
    animation-name: shakeX;
    animation-timing-function: ease-in-out;
    animation-duration: 500ms;
    animation-delay: 0;
  }
`)

const EditDialogContent = ({ onClose, onFormError }) => {
  const classes = useStyles()
  const { formatMessage } = useIntl()
  // Valid dialog states:
  // - `pending` - initial state, checking geo data
  // - `idle` - default state, form is displayed
  // - `error` - no boundaries to export, show instructions
  const [dialogState, setDialogState] = useState('pending')
  // Valid form states:
  // - `idle` - default state, user is filling out form
  // - `error` - a required form field is missing or invalid
  // - `saving` - saving is in progress, disable inputs
  const [formState, setFormState] = useState('idle')

  // TODO: Adopt a form library throughout Mapeo to cut down on
  // repeated form logic
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')
  const [value3a, setValue3a] = useState('')
  const [value3b, setValue3b] = useState('')
  const [value4, setValue4] = useState('')
  const [value5, setValue5] = useState('')
  const [value1Error, setValue1Error] = useState(false)
  const [value2Error, setValue2Error] = useState(false)
  const [value3Error, setValue3Error] = useState(false)
  const [value4Error, setValue4Error] = useState(false)
  const [value5Error, setValue5Error] = useState(false)

  useEffect(() => {
    async function determineDialogState () {
      const data = await getGeoJson()
      if (data?.features?.length > 0) {
        setDialogState('idle')
      } else {
        setDialogState('error')
      }
    }
    determineDialogState()
  })

  const handleClose = () => {
    setFormState('idle')
    onClose()
  }

  const handleSave = async e => {
    e.preventDefault()

    // Input validation
    let error = false
    if (value1 === '') {
      setValue1Error(true)
      error = true
    }
    if (value2 === '') {
      setValue2Error(true)
      error = true
    }
    if (value3a === '' && value3b === '') {
      setValue3Error(true)
      error = true
    }
    if (value4 === '') {
      setValue4Error(true)
      error = true
    }
    if (value5 === '') {
      setValue5Error(true)
      error = true
    }

    // Bail early if there's a required field missing
    if (error === true) {
      setFormState('error')
      onFormError()
      return
    }

    setFormState('saving')
    const points = await getGeoJson()
    const metadata = {
      // Values 1 and 2 are stored as strings because that's how HTML
      // form values like it; we convert it to Boolean values when
      // exporting as json
      communityConsent: value1 === 'true',
      makePublic: value2 === 'true',
      communityOriginalName: value3a,
      communityEnglishName: value3b,
      relationship: value4,
      contact: value5
    }

    remote.dialog
      .showSaveDialog({
        title: 'ICCA Export Package',
        defaultPath: 'mapeo-icca-export',
        filters: [{ name: 'Mapeo ICCA Export Package', extensions: ['mapeoicca'] }]
      })
      .then(({ filePath, canceled }) => {
        if (canceled) return handleClose()
        const filepathWithExtension = path.join(
          path.dirname(filePath),
          path.basename(filePath, '.mapeoicca') + '.mapeoicca'
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

  const isSaving = formState === 'saving'

  let dialogContent
  switch (dialogState) {
    case 'pending':
      dialogContent = null
      break
    case 'idle':
      dialogContent = (
        <form noValidate autoComplete='off'>
          <DialogTitle id='responsive-dialog-title' style={{ paddingBottom: 8 }}>
            <FormattedMessage {...msgs.title} />
          </DialogTitle>

          <DialogContent className={classes.content}>
            <DialogContentText>
              <strong>{formatMessage(msgs.formInstructions)}</strong>
            </DialogContentText>

            <Box my={1.5}>
              <FormControl component="fieldset" error={value1Error}>
                <FormLabel component="legend" className={classes.formLabel}>
                  1. {formatMessage(msgs.question1Prompt)}
                </FormLabel>
                <RadioGroup
                  row
                  aria-label='question1'
                  name='question1'
                  value={value1}
                  onChange={e => {
                    setValue1(e.target.value)
                    setValue1Error(false)
                  }}
                >
                  <FormControlLabel
                    value='true'
                    control={<Radio/>}
                    label={formatMessage(msgs.answerYes)}
                    disabled={isSaving}
                  />
                  <FormControlLabel
                    value='false'
                    control={<Radio/>}
                    label={formatMessage(msgs.answerNo)}
                    disabled={isSaving}
                  />
                </RadioGroup>
                <FormHelperText>
                  {value1Error && formatMessage(msgs.requiredAnswer)}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box my={1.5}>
              <FormControl component="fieldset" error={value2Error}>
                <FormLabel component="legend" className={classes.formLabel}>
                  2. {formatMessage(msgs.question2Prompt)}
                </FormLabel>
                <RadioGroup
                  row
                  aria-label='question2'
                  name='question2'
                  value={value2}
                  onChange={e => {
                    setValue2(e.target.value)
                    setValue2Error(false)
                  }}
                >
                  <FormControlLabel
                    value='true'
                    control={<Radio/>}
                    label={formatMessage(msgs.answerYes)}
                    disabled={isSaving}
                  />
                  <FormControlLabel
                    value='false'
                    control={<Radio/>}
                    label={formatMessage(msgs.answerNo)}
                    disabled={isSaving}
                  />
                </RadioGroup>
                <FormHelperText>
                  {value2Error && formatMessage(msgs.requiredAnswer)}
                </FormHelperText>
              </FormControl>
            </Box>

            <DialogContentText>
              <strong>{formatMessage(msgs.aboutYouSection)}</strong>
            </DialogContentText>

            <Box my={1.5}>
              <FormControl component="fieldset" error={value3Error}>
                <FormLabel component="legend" className={classes.formLabel}>
                  3. {formatMessage(msgs.question3Prompt)}
                </FormLabel>
                <TextField
                  label={formatMessage(msgs.communityOriginalName)}
                  value={value3a}
                  fullWidth
                  variant='outlined'
                  margin='dense'
                  onChange={e => {
                    setValue3a(e.target.value)
                    setValue3Error(false)
                  }}
                  disabled={isSaving}
                />
                <TextField
                  label={formatMessage(msgs.communityEnglishName)}
                  value={value3b}
                  fullWidth
                  variant='outlined'
                  margin='dense'
                  onChange={e => {
                    setValue3b(e.target.value)
                    setValue3Error(false)
                  }}
                  disabled={isSaving}
                />
                <FormHelperText>
                  {formatMessage(msgs.atLeastOneAnswer)}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box my={1.5}>
              <FormControl component="fieldset" error={value4Error}>
                <FormLabel component="legend" className={classes.formLabel}>
                4. {formatMessage(msgs.question4Prompt)}
                </FormLabel>
                <RadioGroup
                  aria-label='question4'
                  name='question4'
                  value={value4}
                  onChange={e => {
                    setValue4(e.target.value)
                    setValue4Error(false)
                  }}
                >
                  <FormControlLabel
                    value='Member of the community/indigenous people'
                    control={<Radio />}
                    label={formatMessage(msgs.question4Answer1)}
                    disabled={isSaving}
                  />
                  <FormControlLabel
                    value='Representative or associate of the community/indigenous people'
                    control={<Radio />}
                    label={formatMessage(msgs.question4Answer2)}
                    disabled={isSaving}
                  />
                  <FormControlLabel
                    value='Representative of a non-governmental organisation'
                    control={<Radio />}
                    label={formatMessage(msgs.question4Answer3)}
                    disabled={isSaving}
                  />
                  <FormControlLabel
                    value='Other'
                    control={<Radio />}
                    label={formatMessage(msgs.question4Answer4)}
                    disabled={isSaving}
                  />
                </RadioGroup>
                <FormHelperText>
                  {value4Error && formatMessage(msgs.requiredAnswer)}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box my={1.5}>
              <FormControl component="fieldset" error={value5Error}>
                <FormLabel component="legend" className={classes.formLabel}>
                  5. {formatMessage(msgs.question5Prompt)}
                </FormLabel>
                <TextField
                  label={formatMessage(msgs.question5Placeholder)}
                  value={value5}
                  fullWidth
                  rows={3}
                  rowsMax={6}
                  multiline
                  variant='outlined'
                  disabled={isSaving}
                  margin='dense'
                  onChange={e => {
                    setValue5(e.target.value)
                    setValue5Error(false)
                  }}
                />
                <FormHelperText>
                  {value5Error && formatMessage(msgs.requiredAnswer)}
                </FormHelperText>
              </FormControl>
            </Box>

            {formState === 'error' && (
              <FormControl component="div" error={true}>
                <FormHelperText>
                  {formatMessage(msgs.errorMissingRequired)}
                </FormHelperText>
              </FormControl>
            )}
          </DialogContent>

          <DialogActions>
            <Button disabled={isSaving} onClick={handleClose}>
              {formatMessage(msgs.cancel)}
            </Button>
            <Button
              disabled={isSaving}
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
      break
    case 'error':
      dialogContent = (
        <>
          <DialogTitle id='responsive-dialog-title' style={{ paddingBottom: 8 }}>
            <FormattedMessage {...msgs.title} />
          </DialogTitle>

          <DialogContent className={classes.content}>
            <DialogContentText>
              <strong>{formatMessage(msgs.noDataSummary)}</strong>
            </DialogContentText>

            {formatMessage(msgs.noDataInstructions)}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleClose}
              color='primary'
              variant='contained'
            >
              {formatMessage(msgs.ok)}
            </Button>
          </DialogActions>
        </>
      )
  }

  return dialogContent
}

export default function ICCAExportDialog ({ onClose, open }) {
  const classes = useStyles()
  const [isShaking, setShaking] = useState(false)

  function onFormError () {
    setShaking(true)
    window.setTimeout(() => {
      setShaking(false)
    }, 500)
  }

  // The 'willChange' class definition pre-optimizes the dialog element
  // for the "shake" animation when there's an error. If we don't do this,
  // the first time the animation plays, it feels janky
  const classNames = [classes.willChange]
  if (isShaking) {
    classNames.push('shakeX')
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      scroll='body'
      aria-labelledby='responsive-dialog-title'
      classes={{
        paper: classNames.join(' ')
      }}
    >
      {open && (
        <EditDialogContent
          onClose={onClose}
          onFormError={onFormError}
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
  },
  formLabel: {
    // Reset form label line-height. The default class for the <FormLabel>
    // component sets the line-height to 1, which is too cramped for long text
    lineHeight: 'initial'
  },
  willChange: {
    willChange: 'transform'
  }
}))

async function getGeoJson () {
  return api.getData({
    format: 'geojson',
    filter: ['==', 'protection_title', 'icca']
  })
}
