// @ts-check
import * as React from 'react'
import {
  Box,
  Button,
  Dialog,
  Link,
  Slide,
  Typography,
  makeStyles
} from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import { Close } from '@material-ui/icons'

import { MapPreviewCard } from './MapPreviewCard'
import {
  useBackgroundMapStore,
  usePersistedUiStore
} from '../../../hooks/store'
import { useMapStylesQuery } from '../../../hooks/useMapStylesQuery'
import Loader from '../../Loader'

const MAPEO_BLUE = '#2469f6'

const m = defineMessages({
  // Title for background maps overlay
  title: 'Background Maps',
  // Label for dismiss button
  close: 'Close',
  // Label for link to manage maps
  manageMapsLink: 'Manage Maps'
})

export const BackgroundMapSelector = ({ active, dismiss }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()
  const { mapStyle, setMapStyle } = useBackgroundMapStore()

  const setTabIndex = usePersistedUiStore(store => store.setTabIndex)

  const navigateToBackgroundMaps = () => {
    dismiss()
    setTabIndex(3) // TODO: Set from an ID rather than hardcoded index
  }

  const { isLoading, data: mapStyles } = useMapStylesQuery()

  return (
    <Dialog
      fullScreen
      open={active}
      onClose={dismiss}
      TransitionComponent={Transition}
    >
      {/* HEADER */}
      <Box className={classes.header}>
        <Box className={classes.row}>
          <Typography variant='h1' className={classes.title}>
            {t(m.title)}
          </Typography>
          <Link
            className={classes.link}
            a='#'
            onClick={navigateToBackgroundMaps}
          >
            {t(m.manageMapsLink)}
          </Link>
        </Box>
        <Button onClick={dismiss} className={classes.closeButton}>
          {t(m.close)}
          <Close />
        </Button>
      </Box>
      {/* MAP STYLES ROW */}
      {isLoading ? (
        <Loading />
      ) : (
        <Box className={classes.styleRow}>
          {mapStyles
            .filter(({ isImporting }) => !isImporting)
            .map(map => {
              const isSelected = mapStyle?.id === map.id
              return (
                <MapPreviewCard
                  onClick={() => {
                    if (isSelected) return
                    dismiss()
                    setMapStyle(map)
                  }}
                  selected={isSelected}
                  styleUrl={map.url}
                  title={map.name}
                  key={map.id}
                />
              )
            })}
        </Box>
      )}
    </Dialog>
  )
}

const Loading = () => {
  const classes = useStyles()

  return (
    <Box className={classes.loaderContainer}>
      <Loader />
    </Box>
  )
}

const Transition = React.forwardRef((props, ref) => (
  <Slide direction='up' mountOnEnter unmountOnExit ref={ref} {...props} />
))

const useStyles = makeStyles(theme => ({
  container: {
    borderRadius: '10px 10px 0px 0px',
    width: '100%',
    minHeight: '40vh',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2
  },
  header: {
    padding: '16px 22px',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    marginRight: 10
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  styleRow: {
    display: 'flex',
    padding: 22,
    flexWrap: 'wrap',
    gap: '40px 20px '
  },
  link: {
    cursor: 'pointer',
    color: MAPEO_BLUE
  },
  loaderContainer: {
    width: '100%',
    marginTop: '10%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    color: MAPEO_BLUE
  }
}))
