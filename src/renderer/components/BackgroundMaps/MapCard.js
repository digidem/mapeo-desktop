// @ts-check
import * as React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles, Typography } from '@material-ui/core'
import { useIntl, defineMessages } from 'react-intl'

const m = defineMessages({
  // Abbreviation for megabytes
  mb: 'MB',
  // indicates how many offline areas
  areas: 'offline areas'
})

/**
 * @typedef MapCardProps
 * @prop {import('../Settings/BGMaps').OfflineMap} offlineMap
 * @prop {React.Dispatch<React.SetStateAction<import('../Settings/BGMaps').OfflineMap['mapId'] | false>>} setMap
 * @prop {import('../Settings/BGMaps').OfflineMap['mapId'] |false } mapBeingViewed
 */

/** @param {MapCardProps} param */
export const MapCard = ({ offlineMap, setMap, mapBeingViewed }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

  const isBeingViewed = React.useMemo(
    () => offlineMap.mapId === mapBeingViewed,
    [offlineMap, mapBeingViewed]
  )

  return (
    <Button
      variant='outlined'
      className={classes.root}
      onClick={() => setMap(offlineMap.mapId)}
    >
      <div
        className={classes.inner}
        style={{ backgroundColor: !isBeingViewed ? '#CCCCD6' : '#0066FF' }}
      >
        <div style={{ width: '30%', border: '1px solid red' }}>hldr</div>
        <div className={classes.text}>
          <Typography variant='subtitle1'>{offlineMap.mapTitle}</Typography>
          <Typography>
            {offlineMap.size} {t(m.mb)}
          </Typography>
          <Typography>
            {offlineMap.offlineAreaCount} {t(m.areas)}
          </Typography>
        </div>
      </div>
    </Button>
  )
}

const useStyles = makeStyles({
  root: {
    height: 90,
    width: '90%',
    marginBottom: 20,
    textTransform: 'none',
    padding: 0,
    '& .MuiButton-root': {
      padding: 0
    },
    '& .MuiButton-outlined': {
      padding: 0
    },
    '& .MuiButton-label': {
      height: '100%'
    }
  },
  inner: {
    display: 'flex',
    flex: 1,
    height: '100%'
  },
  text: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    marginLeft: 10
  }
})
