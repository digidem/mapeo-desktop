// @ts-check
import * as React from 'react'
import {
  Button,
  CardActionArea,
  makeStyles,
  Typography
} from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import { defineMessages, useIntl } from 'react-intl'
import { useMapServerMutation } from '../../hooks/useMapServerMutation'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import { ipcRenderer } from 'electron'

const m = defineMessages({
  // Title of screen used to add a new background map
  addMap: 'Add Map Background',
  // button to cancel the import of a background map
  cancel: 'Cancel',
  // Title for import errot pop up dialog,
  importErrorTitle: 'Background Maps Import Error',
  // Description of map import error
  importErrorDescription:
    'There was an error importing the background maps. Please try again.'
})

/**
 * @typedef ImportMapStyleDialogProps
 * @prop {boolean} open
 * @prop {()=>void} close
 */

/** @param {ImportMapStyleDialogProps} importMapStyleDialogProps */
export const ImportMapStyleDialog = ({ open, close }) => {
  const { formatMessage: t } = useIntl()
  const mutation = useMapServerMutation('post', '/tilesets/import')

  const classes = useStyles()

  async function selectMbTileFile () {
    const result = await ipcRenderer.invoke('select-mb-tile-file')

    if (result.canceled) return
    if (!result.filePaths || !result.filePaths.length) return

    try {
      const filePath = result.filePaths[0]
      console.log({ filePath })
      await mutation.mutateAsync({ filePath })
      close()
    } catch (err) {
      close()
      onError(err)
    }

    function onError (err) {
      console.log({ err })
      // remote.dialog.showErrorBox(t(m.importErrorTitle), t(m.importErrorDescription) + ': ' + err)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      disableBackdropClick={true}
      fullWidth={true}
    >
      <DialogTitle disableTypography className={classes.titleContainer}>
        <Typography variant='body1' className={classes.title}>
          {t(m.addMap)}
        </Typography>
        <IconButton onClick={close}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Card>
          <CardActionArea
            style={{ backgroundColor: '#EDEDED', padding: 30 }}
            onClick={selectMbTileFile}
          >
            <CardContent style={{ textAlign: 'center' }}>
              <SystemUpdateAltIcon style={{ fontSize: 45 }} />
              <Typography
                variant='h2'
                style={{ fontSize: 18, fontWeight: 500 }}
              >
                Import File
              </Typography>
              <Typography variant='h3' style={{ fontSize: 18 }}>
                {'(.mbtiles)'}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={close}>
          {t(m.cancel)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const useStyles = makeStyles({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 24,
    fontWeight: 500
  }
})
