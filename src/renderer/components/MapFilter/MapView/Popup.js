import React, {
  useContext,
  useCallback,
  useLayoutEffect,
  useState,
  useRef
} from 'react'
import { MapContext } from 'react-mapbox-gl'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'

import Image from '../internal/Image'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  wrapper: {
    width: 200,
    padding: 0,
    backgroundColor: 'black',
    cursor: 'pointer',
    position: 'absolute',
    willChange: 'transform',
    top: 0,
    left: 0,
    pointerEvents: 'none'
  },
  wrapperImage: {
    height: 200
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'cover',
    display: 'block',
    background: '#000000'
  },
  titleBox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: '0.25em 0.5em',
    boxSizing: 'border-box'
  },
  title: {
    color: 'white'
  },
  subheading: {
    color: 'white'
  }
})

const Popup = ({ imageUrl, title, subtitle, coordinates }) => {
  const map = useContext(MapContext)
  const ref = useRef(null)
  const classes = useStyles()

  const getPopupTransform = useCallback(() => {
    if (!ref.current) return
    const width = ref.current.offsetWidth
    const height = ref.current.offsetHeight
    const pos = map.project(coordinates).round()
    let anchor

    if (pos.y < height) {
      anchor = 'top'
    } else {
      anchor = 'bottom'
    }

    if (pos.x > map.transform.width - width) {
      anchor += '-right'
    } else {
      anchor += '-left'
    }

    const anchorTranslate = {
      'top-left': 'translate(0,0)',
      'top-right': 'translate(-100%,0)',
      'bottom-left': 'translate(0,-100%)',
      'bottom-right': 'translate(-100%,-100%)'
    }

    return `${anchorTranslate[anchor]} translate(${pos.x}px,${pos.y}px)`
  }, [coordinates, map])

  const [transform, setTransform] = useState(getPopupTransform())

  const update = useCallback(() => setTransform(getPopupTransform()), [
    getPopupTransform
  ])

  useLayoutEffect(() => {
    map.on('move', update)
    update()
    return () => map.off('move', update)
  }, [map, update])

  return (
    <div
      className={clsx(classes.wrapper, { [classes.wrapperImage]: imageUrl })}
      style={{ transform }}
      ref={ref}
    >
      {imageUrl && <Image src={imageUrl} className={classes.image} />}
      <div className={classes.titleBox}>
        {title && (
          <Typography variant='h6' className={classes.title}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant='caption' className={classes.subheading}>
            {subtitle}
          </Typography>
        )}
      </div>
    </div>
  )
}

Popup.imageSize = 200

export default Popup
