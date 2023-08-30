import { Typography, makeStyles, useTheme } from '@material-ui/core'
import React from 'react'
import ReactMapboxGl from 'react-mapbox-gl'

import { MAPBOX_ACCESS_TOKEN } from '../../../../../config'

export const MapboxPreview = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  dragRotate: false,
  pitchWithRotate: false,
  attributionControl: false,
  injectCSS: false
})

export const MapPreviewCard = ({ onClick, selected, styleUrl, title }) => {
  const classes = useStyles()
  const theme = useTheme()

  return (
    <>
      <button className={classes.container} onClick={onClick}>
        <div
          style={{
            borderColor: selected
              ? theme.palette.primary.main
              : theme.palette.common.white
          }}
          className={classes.inner}
        >
          <MapboxPreview
            className={classes.thumbnail}
            containerStyle={{
              pointerEvents: 'none'
            }}
            style={styleUrl}
            center={[-77, 0]}
            zoom={[0]}
          />
        </div>
        {title && <Typography className={classes.title}>{title}</Typography>}
      </button>
    </>
  )
}

const useStyles = makeStyles(theme => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none'
  },
  inner: {
    borderRadius: 12,
    borderStyle: 'solid',
    marginBottom: 10,
    borderWidth: 4,
    overflow: 'hidden'
  },
  thumbnail: {
    height: 80,
    width: 80,
    cursor: 'pointer',
    '& .mapboxgl-control-container': {
      display: 'none'
    }
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    maxWidth: 80
  }
}))
