import React from 'react'
import { LinearProgress, Typography, makeStyles } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import Button from '@material-ui/core/Button'
import FormattedDuration from 'react-intl-formatted-duration'
import ErrorIcon from '@material-ui/icons/Error'
import Paper from '@material-ui/core/Paper'
import Loader from '../Loader'

import STATES from './states'
export { default as STATES } from './states'

const m = defineMessages({
  // Title on sync screen when searching for devices
  updateAvailable: 'Update Available',
  updateNotAvailable: 'Mapeo is up to date! You are on the latest version.',
  downloadButtonText: 'Download now',
  calculatingProgress: 'Estimating...',
  downloadProgress: 'Download Progress',
  restartMapeoText: 'An update to Mapeo has been downloaded. Restart Mapeo to update.',
  restartMapeoButton: 'Restart Mapeo.',
  errorTitle: 'Error',
  errorMessage: 'There was an error and Mapeo could not update. Try again later.',
  patchUpdate: 'This update includes critical bug fixes. Please update.',
  minorUpdate: 'This update includes improvements that may change your experience.',
  majorUpdate: 'This update will make your application incompatible with earlier verions.',
  unknownDownloadSpeed: 'Unknown',
  estimatedDownloadTime: 'Estimated download time:'
})

const errors = {
  ERR_UPDATER_CHANNEL_FILE_NOT_FOUND: 'This channel does not have any updates'
}

export const UpdateTab = ({ update }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()

  var internal = function () {
    switch (update.state) {
      case STATES.AVAILABLE:
        return <Typography>{t(m.updateAvailable)}</Typography>
      case STATES.DOWNLOADING:
        return <Typography>{t(m.calculatingProgress)}</Typography>
      case STATES.PROGRESS:
        return <Typography>{t(m.downloadProgress)}</Typography>
      case STATES.READY_FOR_RESTART:
        return <Typography>{t(m.restartMapeoButton)}</Typography>
      case STATES.ERROR:
        return <Typography style={{ color: 'red' }}>
          {t(m.errorTitle)}
        </Typography>
      default: // STATES.IDLE, STATES.UPDATE_NOT_AVAILABLE:
        return null
    }
  }

  return <div className={cx.updateTab}>{internal()}</div>
}

export const UpdaterView = ({ update, setUpdate }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()

  var internal = function () {
    switch (update.state) {
      case STATES.AVAILABLE:
        return <UpdateAvailableView cx={cx} update={update} setUpdate={setUpdate} />
      case STATES.DOWNLOADING:
        return <Typography>{t(m.calculatingProgress)}</Typography>
      case STATES.PROGRESS:
        return <DownloadProgressView cx={cx} percent={update.progress.percent} update={update} />
      case STATES.READY_FOR_RESTART:
        return <RestartView cx={cx} />
      case STATES.UPDATE_NOT_AVAILABLE:
        return <UpdateNotAvailableView cx={cx} />
      case STATES.ERROR:
        return (
          <Typography>
            <ErrorIcon
              fontSize='inherit'
              className={cx.icon}
              style={{ color: 'red' }}
            />
            {t(m.errorMessage)}
            {update.updateInfo.code}
            {errors[update.updateInfo.code]}
          </Typography>
        )
      default: // STATES.IDLE
        return null
    }
  }

  return (
    <div className={cx.root}>
      <div className={cx.searchingWrapper}>
        <div className={cx.searching}>
          {internal()}
        </div>
      </div>
    </div>
  )
}

const RestartView = ({ cx }) => {
  const { formatMessage: t } = useIntl()
  return (
    <div className={cx.searchingText}>
      <Typography gutterBottom variant='h2' className={cx.searchingTitle}>
        {t(m.restartMapeoText)}
      </Typography>
    </div>
  )
}

const DownloadProgressView = ({ cx, update, percent }) => {
  /*
      {
        progress: {
          total: 141164463,
          delta: 1655048,
          transferred: 11384326,
          percent: 8.064583506402741,
          bytesPerSecond: 2244544
        }
      }
  */

  const progress = update.progress
  let estimatedTimeLeft

  if (progress) {
    estimatedTimeLeft = progress.total ? (progress.total - progress.transferred) / progress.bytesPerSecond : 0
  }

  return (
    <div className={cx.searchingText}>
      <Loader />
      <LinearProgress variant='determinate' value={percent} color='secondary' />
      <Typography>
        {estimatedTimeLeft && <FormattedDuration seconds={estimatedTimeLeft} />}
      </Typography>
    </div>
  )
}

const UpdateAvailableView = ({ cx, update, setUpdate }) => {
  const { formatMessage: t } = useIntl()

  const { size, downloadSpeed, releaseSummary, major, minor, patch } = update.updateInfo

  const estimatedDownloadTime = downloadSpeed
    ? <FormattedDuration seconds={size / downloadSpeed.bps} />
    : t(m.unknownDownloadSpeed)

  return (
    <div className={cx.searchingText}>
      <Typography gutterBottom variant='h2' className={cx.searchingTitle}>
        {t(m.updateAvailable)}
      </Typography>
    <Paper>
      <div className={cx.wrapper}>
        <div className={cx.content}>

      <Typography>
        {
          major
            ? t(m.majorUpdate)
            : minor
              ? t(m.minorUpdate)
              : patch
                ? t(m.patchUpdate)
                : ''
        }
      </Typography>

      <Typography variant='body'>
        {t(m.estimatedDownloadTime)} {estimatedDownloadTime}
      </Typography>

      <Button
        onClick={setUpdate.downloadUpdate}
        variant='contained'
        size='large'
        color='primary'>
        {t(m.downloadButtonText)}
      </Button>
    </div>
    </div>
    </Paper>
    </div>
  )
}

const ExpandedNotes = ({ releaseSummary }) => {
  return <div>
    <Typography variant='body'>{releaseSummary}</Typography>
  </div>
}

const HiddenNotes = ({ releaseSummary }) => {
  return <div>
    <Typography variant='body'>{releaseSummary}</Typography>
  </div>
}

const UpdateNotAvailableView = ({ cx, update, downloadUpdateClick }) => {
  const { formatMessage: t } = useIntl()
  return (
    <div className={cx.searchingText}>
      <Typography gutterBottom variant='h2' className={cx.searchingTitle}>
        {t(m.updateNotAvailable)}
      </Typography>
    </div>
  )
}

const useStyles = makeStyles(theme => ({
  searchingText: {
    maxWidth: 300,
    marginLeft: theme.spacing(2)
  },
  searchingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'stretch',
    justifySelf: 'stretch'
  },
  searching: {
    color: '#00052b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  searchingTitle: {
    fontSize: '2em',
    fontWeight: 400
  },
  root: {
    height: '100%',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5'
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '10%'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 48
  }
}))
