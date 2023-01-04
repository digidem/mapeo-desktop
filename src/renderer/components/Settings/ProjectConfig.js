// @ts-check
import * as React from 'react'
import { Button, makeStyles, Paper, Typography } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import { useQuery } from '@tanstack/react-query'
import api from '../../new-api'
import { ipcRenderer, remote } from 'electron'

const m = defineMessages({
  // title of project setting page
  title: 'Project Settings',
  projectName: 'Project Name',
  config: 'Config',
  importConfig: 'Import Config'
})

export const ProjectConfig = () => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  /** @type {import('@tanstack/react-query').UseQueryResult<{name:string, version:string}|undefined>}  */
  const { data: metadata } = useQuery(['metadata'], () => api.getMetadata())

  /** @type {import('@tanstack/react-query').UseQueryResult<string>} */
  const { data: encryptionKey } = useQuery(['encryptionKey'], () =>
    api.getEncryptionKey()
  )

  async function importConfig () {
    const result = await remote.dialog.showOpenDialog({
      title: t(m.importConfig),
      filters: [{ name: 'Mapeo Settings', extensions: ['mapeosettings'] }],
      properties: ['openFile']
    })
    if (result.canceled) return
    if (!result.filePaths || !result.filePaths.length) return

    ipcRenderer.send('update-config', result.filePaths[0])
    window.location.reload()
    //   userConfig.importSettings(result.filePaths[0], err => {
    //     if (err) return onerror(err)
    //     ipc.send('reload-config', async err => {
    //       if (err) {
    //         logger.error(err)
    //         logger.debug('[SYSTEM] Forcing window refresh')
    //         focusedWindow.webContents.send('force-refresh-window')
    //         return
    //       }
    //       const data = userConfig.getSettings('metadata')
    //       await dialog.showMessageBox({
    //         message: t('menu-config-complete') + data.name,
    //         buttons: [t('button-submit')]
    //       })
    //       focusedWindow.webContents.send('force-refresh-window')
    //     })
    //   })

    //   function onerror (err) {
    //     dialog.showErrorBox(
    //       t('menu-import-configuration-error'),
    //       t('menu-import-configuration-error-known') + ': ' + err
    //     )
    //   }
  }

  return (
    <Paper
      style={{
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <Paper className={classes.banner}>
        <Typography variant='h5'>{t(m.title)}</Typography>
      </Paper>
      <div style={{ padding: 20, backgroundColor: '#f6f6f6', height: '100%' }}>
        <div className={classes.listItem}>
          <Typography style={{ fontWeight: 500 }}>
            {t(m.projectName) + ':'} &nbsp;
          </Typography>
          <Typography>
            {[
              metadata ? metadata.name : '',
              metadata ? metadata.version : ''
            ].join(' ')}
          </Typography>
        </div>
        <div className={classes.listItem}>
          <Typography style={{ fontWeight: 500 }}>
            {t(m.config) + ':'} &nbsp;
          </Typography>
          <Typography>
            {encryptionKey
              ? `${encryptionKey.slice(0, 5)}${'*'.repeat(10)}`
              : 'MAPEO'}
          </Typography>
        </div>

        <Button
          style={{ textTransform: 'none', marginTop: 20 }}
          variant='contained'
          onClick={importConfig}
        >
          {t(m.importConfig)}
        </Button>
      </div>
    </Paper>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    height: '100'
  },
  banner: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 20
  }
})
