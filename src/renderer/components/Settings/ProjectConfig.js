// @ts-check
import { Button, makeStyles, Typography } from '@material-ui/core'

import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import api from '../../new-api'
import Dialog from '@material-ui/core/Dialog'
import { ProjectInviteDialog } from '../dialogs/ProjectInvite'

const m = defineMessages({
  // Title from the Project Configuration Page
  projConfigTitle: 'Project Configuration',
  // Button to join a new project
  joinProject: 'Join A Project',
  // Label to indicate the project name
  projectName: 'Project Name',
  // Label to indicate the config
  config: 'Config',
  // Button to import a new config
  importConfig: 'Import Config'
})

export const ProjectConfig = () => {
  const { formatMessage: t } = useIntl()

  const [metadata, setMetadata] = React.useState({ name: '', config: '' })
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const cx = useStyles()

  React.useEffect(() => {
    async function getMetadata () {
      const configData = await api.getMetadata()
      setMetadata({ name: configData.name, config: configData.version })
    }

    getMetadata()
  }, [])

  return (
    <React.Fragment>
      <div style={{ flex: 1 }}>
        {/* Top Header */}
        <div className={cx.header}>
          <Typography variant='h5'>{t(m.projConfigTitle)}</Typography>
          <Button
            style={{ textTransform: 'none' }}
            onClick={() => {
              setDialogOpen(prev => !prev)
            }}
            variant='outlined'
          >
            {t(m.joinProject)}
          </Button>
        </div>
        {/* Body */}
        <div className={cx.body}>
          <div className={cx.textContent}>
            <Typography style={{ fontWeight: 'bold' }}>
              {t(m.projectName) + ':'}&nbsp;&nbsp;
            </Typography>
            <Typography>{metadata.name}</Typography>
          </div>
          <div className={cx.textContent}>
            <Typography style={{ fontWeight: 'bold' }}>
              {t(m.config) + ':'}&nbsp;&nbsp;
            </Typography>
            <Typography>{metadata.config} </Typography>
          </div>

          <Button
            style={{ textTransform: 'none', marginTop: 10 }}
            variant='contained'
            color='primary'
          >
            {t(m.importConfig)}
          </Button>
        </div>
      </div>
      <ProjectInviteDialog
        isOpen={dialogOpen}
        toggleOpenClose={() => {
          setDialogOpen(prev => !prev)
        }}
      />
    </React.Fragment>
  )
}

const useStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    width: '100%'
  },
  body: {
    backgroundColor: '#F6F6F6',
    padding: 20,
    height: '100%'
  },
  textContent: {
    display: 'flex',
    marginBottom: 10
  }
})
