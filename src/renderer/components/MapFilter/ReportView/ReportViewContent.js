// @flow
import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import getScrollBarWidth from 'get-scrollbar-width'
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized'
import type { Observation } from 'mapeo-schema'

// import ReportFeature from './ReportFeature'
import ReportPageContent from './ReportPageContent'
import ReportPaper from './ReportPaper'
import MapView from '../MapView/MapViewContent'
import { cm, inch } from '../utils/dom'
import { getLastImage, defaultGetPreset } from '../utils/helpers'

import type { PaperSize, CameraOptions, CommonViewContentProps } from '../types'

export type ReportViewContentProps = {
  /** Called with
   * [CameraOptions](https://docs.mapbox.com/mapbox-gl-js/api/#cameraoptions)
   * with properties `center`, `zoom`, `bearing`, `pitch` */
  onMapMove?: CameraOptions => any,
  /** Initial position of the map - an object with properties `center`, `zoom`,
   * `bearing`, `pitch`. If this is not set then the map will by default zoom to
   * the bounds of the observations. If you are going to unmount and re-mount
   * this component (e.g. within tabs) then you will want to use onMove to store
   * the position in state, and pass it as initialPosition for when the map
   * re-mounts. */
  initialMapPosition?: $Shape<CameraOptions>,
  /** Mapbox access token */
  mapboxAccessToken: string,
  /** Mapbox style url */
  mapStyle?: any
}

type Props = {
  ...$Exact<ReportViewContentProps>,
  ...$Exact<CommonViewContentProps>,
  /** Paper size for report */
  paperSize?: PaperSize,
  /** Render for printing (for screen display only visible observations are
   * rendered, for performance reasons) */
  print?: boolean
}

const BORDER_SIZE = 0.5 * inch()
const noop = () => {}

const ReportViewContent = ({
  observations,
  onClick = () => {},
  onMapMove,
  initialMapPosition,
  getPreset = defaultGetPreset,
  getMedia,
  paperSize = 'a4',
  print = false,
  mapboxAccessToken,
  mapStyle
}: Props) => {
  const classes = useStyles()
  const [mapPosition, setMapPosition] = useState()
  const scrollbarWidth = useMemo(() => getScrollBarWidth(), [])

  const cacheRef = React.useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 200
    })
  )
  const cache = cacheRef.current

  const paperWidthPx = paperSize === 'a4' ? 21 * cm() : 8.5 * inch()

  function getLastImageUrl(observation: Observation): string | void {
    const lastImageAttachment = getLastImage(observation)
    if (!lastImageAttachment) return
    const media = getMedia(lastImageAttachment, {
      width: paperWidthPx - 2 * BORDER_SIZE,
      height: paperWidthPx - 2 * BORDER_SIZE
    })
    if (media) return media.src
  }

  function renderPage({ index, key, style, parent }) {
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}>
        <div style={style}>
          {index === 0
            ? renderMapPage({ index, key })
            : renderFeaturePage({ index: index - 1, key })}
        </div>
      </CellMeasurer>
    )
  }

  function renderMapPage({ key }: { key?: string } = {}) {
    return (
      <ReportPaper
        key={key}
        paperSize={paperSize}
        classes={{ content: classes.paperContentMap }}>
        <MapView
          mapStyle={mapStyle}
          onClick={noop}
          getPreset={getPreset}
          observations={observations}
          getMedia={getMedia}
          initialMapPosition={initialMapPosition || mapPosition}
          onMapMove={onMapMove || setMapPosition}
          mapboxAccessToken={mapboxAccessToken}
          print
        />
      </ReportPaper>
    )
  }

  function renderFeaturePage({ index, key }: { index: number, key?: string }) {
    const observation = observations[index]
    const coords =
      typeof observation.lon === 'number' && typeof observation.lat === 'number'
        ? {
            longitude: observation.lon,
            latitude: observation.lat
          }
        : undefined
    const createdAt =
      typeof observation.created_at === 'string'
        ? new Date(observation.created_at)
        : undefined
    const preset = getPreset(observation) || {}
    const fields = preset.fields.concat(preset.additionalFields)
    return (
      <ReportPaper
        key={key}
        paperSize={paperSize}
        onClick={() => onClick(observation.id)}>
        <ReportPageContent
          name={typeof preset.name === 'string' ? preset.name : undefined}
          createdAt={createdAt}
          coords={coords}
          fields={fields}
          imageSrc={getLastImageUrl(observation)}
          tags={observation.tags}
          paperSize={paperSize}
        />
      </ReportPaper>
    )
  }

  function renderVirtualList() {
    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            className={classes.reportWrapper + ' ' + classes[paperSize]}
            containerStyle={{ overflowX: 'scroll' }}
            height={height}
            width={width}
            rowCount={observations.length + 1 /* for additional map page */}
            rowRenderer={renderPage}
            deferredMeasurementCache={cache}
            rowHeight={cache.rowHeight}
            overscanRowCount={3}
            estimatedRowSize={
              200 /* paperSize === 'a4' ? 29.7 * cm() : 11 * inch()} */
            }
          />
        )}
      </AutoSizer>
    )
  }

  function renderPrintList() {
    return (
      <React.Fragment>
        {renderMapPage()}
        {observations.map((_, index) =>
          renderFeaturePage({ index, key: index + '' })
        )}
      </React.Fragment>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.scrollWrapper}>
        {print ? renderPrintList() : renderVirtualList()}
      </div>
    </div>
  )
}

export default ReportViewContent

const useStyles = makeStyles({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(236, 236, 236, 1)',
    '@media only print': {
      width: 'auto',
      height: 'auto',
      position: 'static',
      backgroundColor: 'inherit',
      display: 'block'
    }
  },
  reportWrapper: {
    '@media only print': {
      padding: 0,
      minWidth: 'auto'
    }
  },
  paperContentMap: {
    display: 'flex'
  },
  letter: {
    '&$reportWrapper': {
      // minWidth: 8.5 * inch()
    }
  },
  a4: {
    '&$reportWrapper': {
      // minWidth: 21 * cm()
    }
  },
  scrollWrapper: {
    flex: '1 1 auto',
    overflow: 'hidden',
    '@media only print': {
      overflow: 'auto',
      flex: 'initial',
      position: 'static'
    }
  },
  '@global': {
    '@media only print': {
      tr: {
        pageBreakInside: 'avoid'
      },
      '.d-print-none': {
        display: 'none'
      },
      '.mapboxgl-ctrl-group, .mapboxgl-ctrl-attrib': {
        display: 'none'
      }
    }
  }
})
