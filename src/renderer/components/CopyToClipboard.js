// @ts-check
import * as React from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import FileCopy from '@material-ui/icons/FileCopy'
import Snackbar from '@material-ui/core/Snackbar'
import { defineMessages, useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import MuiAlert from '@material-ui/lab/Alert'

const m = defineMessages({
  // message indicated that text has been copied to clipboard
  copied: 'Copied to clipboard',
  // message to user indicating that clicking the button will copy text
  copyText: 'Copy text'
})

/**
 * @typedef CopyToClipboardProps
 * @prop {string} textToCopy
 * @prop {function} [onCopy]
 */

/** @param {CopyToClipboardProps} props */
export const CopyToClipboard = ({ textToCopy, onCopy }) => {
  const { formatMessage: t } = useIntl()

  const [open, setOpen] = React.useState(false)

  const cx = useStyles()

  function handleClick () {
    if (onCopy) {
      onCopy()
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      setOpen(true)
    })
  }

  return (
    <React.Fragment>
      <div className={cx.textField}>
        <TextField
          style={{ minWidth: '90%' }}
          value={textToCopy}
          variant='outlined'
        />
        <Tooltip title={t(m.copyText)} placement='top'>
          <Button variant='contained' color='primary' onClick={handleClick}>
            <FileCopy />
          </Button>
        </Tooltip>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => {
          setOpen(false)
        }}
      >
        <Alert severity='success'>
          <Typography>{t(m.copied)}</Typography>
        </Alert>
      </Snackbar>
    </React.Fragment>
  )
}

const Alert = props => {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const useStyles = makeStyles({
  textField: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  }
})
