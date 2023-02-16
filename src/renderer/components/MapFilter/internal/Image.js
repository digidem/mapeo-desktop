//
import React from 'react'
import Img from 'react-image'
import CircularProgress from '@material-ui/core/CircularProgress'
import BrokenImageIcon from '@material-ui/icons/BrokenImage'
import { makeStyles } from '@material-ui/core/styles'
// import * as CSS from 'csstype'

const useStyles = makeStyles({
  wrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    position: 'relative',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const ImageLoader = ({ classes, style }) => (
  <div className={classes.wrapper} style={{ ...style, color: 'white' }}>
    <CircularProgress color='inherit' />
  </div>
)

const BrokenImage = ({ classes, style }) => (
  <div className={classes.wrapper} style={{ ...style, color: 'white' }}>
    <BrokenImageIcon color='inherit' />
  </div>
)

const Image = ({ style, src, className }) => {
  const classes = useStyles()
  return (
    <Img
      src={src}
      style={{ objectFit: 'contain', display: 'block', ...style }}
      className={className}
      loader={<ImageLoader style={style} classes={classes} />}
      unloader={<BrokenImage style={style} classes={classes} />}
    />
  )
}

export default Image
