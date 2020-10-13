import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ExportIcon from '@material-ui/icons/MoreVert'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Dialog from '@material-ui/core/Dialog'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import { makeStyles } from '@material-ui/core/styles'
import { remote } from 'electron'

import logger from '../../../logger'
import api from '../../new-api'

const m = defineMessages({
  // Button tooltip on iD Editor toolbar
  exportButton: 'Export map data',
  // Menu item for exporting GeoJSON
  exportGeoJson: 'Export GeoJSON…',
  // Menu item for exporting Shapefile
  exportShapefile: 'Export Shapefile…',
  // OK button after successful export
  okButton: 'OK',
  // Close button after export error
  closeButton: 'Close',
  // Export dialog title - shown during export progress and after success/failure
  dialogTitle: 'Exporting data',
  // Export success message,
  dialogSuccess: 'Export complete',
  // Expor error message - if there was an error during export
  dialogError: 'Export failed due to an internal error',
  // Save dialog title
  saveTitle: 'Export map data',
  // Default filename for map export
  defaultFilename: 'mapeo-map-data'
})

const DialogTitle = () => (
  <MuiDialogTitle id='dialog-title'>
    <FormattedMessage {...m.dialogTitle} />
  </MuiDialogTitle>
)

const DialogAction = ({ children, onClick }) => (
  <DialogActions>
    <Button onClick={onClick} color='primary' variant='contained' autoFocus>
      {children}
    </Button>
  </DialogActions>
)

const ExportButton = () => {
  const { formatMessage: t } = useIntl()
  const [status, setStatus] = React.useState('idle')
  const cx = useStyles()
  const [menuAnchor, setMenuAnchor] = React.useState(null)

  const handleExportClick = event => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuItemClick = format => () => {
    setMenuAnchor(null)
    const ext = format === 'shapefile' ? 'zip' : 'geojson'
    remote.dialog.showSaveDialog(
      {
        title: t(m.saveTitle),
        defaultPath: t(m.defaultFilename) + '.' + ext,
        filters: [{ name: format, extensions: [ext] }]
      }
    ).then(({ canceled, filePath }) => {
      if (!filePath || canceled) return
      setStatus('pending')
      api
        .exportData(filePath, { format })
        .then(() => {
          setStatus('success')
        })
        .catch(err => {
          setStatus('reject')
          logger.error('ExportButton save dialog', err)
        })
    }
    )
  }

  const close = event => {
    setStatus('idle')
  }

  let dialogContent
  switch (status) {
    case 'idle':
      dialogContent = null
      break
    case 'pending':
      dialogContent = (
        <>
          <DialogTitle />
          <DialogContent>
            <LinearProgress indeterminate />
          </DialogContent>
        </>
      )
      break
    case 'success':
      dialogContent = (
        <>
          <DialogTitle />
          <DialogContent>
            <DialogContentText>
              <FormattedMessage {...m.dialogSuccess} />
            </DialogContentText>
          </DialogContent>
          <DialogAction onClick={close}>
            <FormattedMessage {...m.okButton} />
          </DialogAction>
        </>
      )
      break
    case 'reject':
      dialogContent = (
        <>
          <DialogTitle />
          <DialogContent>
            <DialogContentText>
              <FormattedMessage {...m.dialogError} />
            </DialogContentText>
          </DialogContent>
          <DialogAction onClick={close}>
            <FormattedMessage {...m.closeButton} />
          </DialogAction>
        </>
      )
      break
  }

  return (
    <>
      <Tooltip title={t(m.exportButton)}>
        <IconButton
          aria-label='export'
          onClick={handleExportClick}
          aria-controls='export-menu'
          aria-haspopup='true'
          className={cx.button}
        >
          <ExportIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id='export-menu'
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuItemClick(null)}
      >
        <MenuItem onClick={handleMenuItemClick('geojson')}>
          <FormattedMessage {...m.exportGeoJson} />
        </MenuItem>
      </Menu>
      <Dialog
        open={status !== 'idle'}
        aria-labelledby='dialog-title'
        maxWidth='xs'
        fullWidth
        disableBackdropClick={status === 'pending'}
        disableEscapeKeyDown={status === 'pending'}
        onClose={() => setStatus('idle')}
      >
        {dialogContent}
      </Dialog>
    </>
  )
}

export default ExportButton

const useStyles = makeStyles({
  button: {
    width: 40,
    margin: '0 5px'
  }
})
