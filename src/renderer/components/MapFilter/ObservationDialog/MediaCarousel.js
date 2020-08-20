// @flow
import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'
import clsx from 'clsx'
import SwipeableViews from 'react-swipeable-views'
import AutoSizer from 'react-virtualized-auto-sizer'

const styles = {
  container: {
    backgroundColor: 'black',
    position: 'relative'
  },
  widget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    display: 'flex'
  },
  buttonPrevContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  buttonNextContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  dotsWidget: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 6,
    pointerEvents: 'none'
  },
  button: {
    color: 'white',
    zIndex: 400,
    pointerEvents: 'auto',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(0, 0, 0, 0.35)'
    }
  },
  dot: {
    zIndex: 400,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundClip: 'content-box',
    border: 'solid 4px transparent',
    backgroundColor: 'rgba(255,255,255,0.5)',
    pointerEvents: 'auto',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  dotHighlight: {
    backgroundColor: 'rgba(255,255,255,1)'
  }
}

const useStyles = makeStyles(styles)

const NextPrevButtons = ({ index, total, onChangeIndex }) => {
  const cx = useStyles()
  if (total <= 1) return null
  const showNext = total > 1 && index < total - 1
  const showPrev = total > 1 && index > 0
  return (
    <>
      <div className={cx.buttonPrevContainer}>
        {showPrev && (
          <IconButton
            onClick={() => onChangeIndex(index - 1)}
            className={cx.button}
          >
            <NavigateBeforeIcon />
          </IconButton>
        )}
      </div>
      <div className={cx.buttonNextContainer}>
        {showNext && (
          <IconButton
            onClick={() => onChangeIndex(index + 1)}
            className={cx.button}
          >
            <NavigateNextIcon />
          </IconButton>
        )}
      </div>
    </>
  )
}

const Dots = ({
  index,
  total,
  onChangeIndex
}: {
  index: number,
  total: number,
  onChangeIndex: (index: number) => any
}) => {
  const cx = useStyles()
  if (total <= 1) return null
  return (
    <div className={cx.dotsWidget}>
      {Array(total)
        .fill()
        .map((_, i) => (
          <div
            key={i}
            role='button'
            className={clsx(cx.dot, {
              [cx.dotHighlight]: index === i
            })}
            onClick={() => onChangeIndex(i)}
          />
        ))}
    </div>
  )
}

const MediaItem = ({
  src,
  type,
  width,
  height
}: {
  src: string,
  type: 'image',
  width: number,
  height: number
}) => (
  <div style={{ width, height, position: 'relative' }}>
    <img
      style={{ width, height, objectFit: 'contain', display: 'block' }}
      src={src}
    />
  </div>
)

const MediaCarousel = ({
  items,
  style,
  initialIndex,
  className
}: {
  /** Array of media items to show, only type=`image` is currently supported */
  items: Array<{ type: 'image', src: string }>,
  style?: {},
  /** Initial index of image to show */
  initialIndex?: number,
  className?: string
}) => {
  const [index, setIndex] = useState(
    // Initially display the *last* image unless initialIndex is set
    initialIndex === undefined ? items.length - 1 : initialIndex
  )
  const cx = useStyles()
  return (
    <div style={style} className={clsx(cx.container, className)}>
      <AutoSizer style={{ width: '100%', height: '100%' }}>
        {({ width, height }) => (
          <SwipeableViews
            enableMouseEvents
            index={index}
            onChangeIndex={setIndex}
          >
            {items.map(({ src, type }, idx) => (
              <MediaItem
                key={idx}
                src={src}
                type={type}
                width={width}
                height={height}
              />
            ))}
          </SwipeableViews>
        )}
      </AutoSizer>
      <Dots index={index} total={items.length} onChangeIndex={setIndex} />
      <NextPrevButtons
        index={index}
        total={items.length}
        onChangeIndex={setIndex}
      />
    </div>
  )
}

export default MediaCarousel
