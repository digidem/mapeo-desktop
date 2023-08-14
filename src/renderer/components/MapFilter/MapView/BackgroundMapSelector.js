import * as React from 'react'
import {
  Box,
  Button,
  Paper,
  Slide,
  Typography,
  makeStyles
} from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import { Close } from '@material-ui/icons'
import { MapPreviewCard } from './MapPreviewCard'
import { useBackgroundMapStore } from '../../../hooks/store'

const STYLES = [
  {
    id: '7p2524cknfdg2pqntxv2qs592nd6x6xt',
    name: 'trails-with-a-name',
    bytesStored: 969515,
    url: 'http://127.0.0.1:5300/styles/7p2524cknfdg2pqntxv2qs592nd6x6xt'
  },
  {
    id: 'xhe52hsmq65w15emmr2zehw3d6jjtha0',
    name: 'other-map-with-another-name',
    bytesStored: 969515,
    url: 'mapbox://styles/mapbox/streets-v12'
  }
]

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
  const [mapStyle, setMapStyle] = useBackgroundMapStore(store => [
    store.mapStyle,
    store.setMapStyle
  ])

  return (
    <Slide direction='up' in={active} mountOnEnter unmountOnExit>
      <Paper elevation={2} className={classes.container}>
        {/* HEADER */}
        <Box className={classes.header}>
          <Typography variant='h1' className={classes.title}>
            {t(m.title)}
          </Typography>
          <Button onClick={dismiss} color='primary'>
            {t(m.close)}
            <Close />
          </Button>
        </Box>
        {/* MAP STYLES ROW */}
        <Box className={classes.styleRow}>
          {STYLES.filter(({ isImporting }) => !isImporting).map(
            ({ id, url, name }) => {
              const isSelected = mapStyle === id
              return (
                <>
                  <div className={classes.mapCardWrapper} key={id}>
                    <MapPreviewCard
                      onClick={() => {
                        if (isSelected) return
                        dismiss()
                        setMapStyle(id)
                      }}
                      selected={isSelected}
                      styleUrl={url}
                      title={name}
                    />
                  </div>
                </>
              )
            }
          )}
        </Box>
      </Paper>
    </Slide>
  )
}

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
    marginRight: 5
  },
  styleRow: {
    display: 'flex',
    padding: 22
  },
  mapCardWrapper: {
    marginRight: 32
  }
}))
