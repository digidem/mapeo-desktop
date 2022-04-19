// @ts-check
import {
  Button,
  Card,
  Fade,
  IconButton,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Loading from './Loading'

const m = defineMessages({
  // Title for Offline Areas
  offlineAreas: 'Offline Areas',
  // Button to create an offline area
  createOfflineArea: 'Create Offline Area',
  // Level of detail seen on map - farthest zoom level
  lvlDetailGlobal: 'Global',
  // Level of detail seen on map - second farthest zoom level
  lvlDetailSubcontinent: 'Subcontinent',
  // Level of detail seen on map - can see large countries
  lvlDetailLargeCountry: 'Large Country',
  // Level of detail seen on map - can see smaller countries
  lvlDetailSmallCountry: 'Small Country',
  // Level of detail seen on map - can see details of large metropolitan areas
  lvlDetailLargeMetro: 'Large Metropolitan Area',
  // Level of detail seen on map - can see most Cities on Map
  lvlDetailCity: 'City',
  // Level of detail seen on map - can see most towns on map
  lvlDetailTown: 'Town',
  // Level of detail seen on map - can see villages on map
  lvlDetailVillage: 'Village',
  // Level of detail seen on map - can see small roads on map
  lvlDetailSmallRoad: 'Small Road',
  // Level of detail seen on map - can see most streets on map
  lvlDetailStreet: 'Street',
  // Level of detail seen on map - can see details of street blocks on map
  lvlDetailStreetBlock: 'Street Block',
  // Level of detail seen on map - can see addresses on map
  lvlDetailAddress: 'Address',
  // Level of detail seen on map - can see street intersections on map
  lvlDetailStreetIntersection: 'Street Intersection'
})

/**
 * @typedef OfflineMapInfoProps
 * @prop {string} mapId
 * @prop {string} currentMapId
 */

/** @param {OfflineMapInfoProps} props */
export const OfflineMapInfo = ({ mapId, currentMapId }) => {
  const shouldLoad = React.useMemo(() => mapId === currentMapId, [
    mapId,
    currentMapId
  ])

  const [info, setInfo] = React.useState(null)
  const { formatMessage: t } = useIntl()

  const classes = useStyles()

  React.useEffect(() => {
    /**
     * @param {string} mapId
     */
    async function getMapInfo (mapId) {
      setTimeout(() => setInfo('Map Title: ' + mapId), 1000)
    }

    if (shouldLoad) {
      getMapInfo(mapId)
    }
  }, [shouldLoad, mapId])

  return shouldLoad ? (
    <Fade in={shouldLoad} timeout={600}>
      <Paper style={{ flex: 1, width: '100%' }}>
        {!info ? (
          <div style={{ padding: 40 }}>
            <Loading />
          </div>
        ) : (
          <div style={{ height: '100%' }}>
            <div className={classes.imgContainer}>
              <img
                className={classes.img}
                src='https://via.placeholder.com/500'
                alt='Map'
              />
            </div>
            <div style={{ padding: 40 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography>{t(m.offlineAreas)}</Typography>
                <Button style={{ color: '#0066FF', textTransform: 'none' }}>
                  {t(m.createOfflineArea)}
                </Button>
              </div>
              <div></div>
            </div>
          </div>
        )}
      </Paper>
    </Fade>
  ) : null
}

/**
 * @typedef OfflineAreaCardProps
 * @prop {number} zoomLevel
 * @prop {string} title
 * @prop {number} size
 */

/** @param {OfflineAreaCardProps} props */
const OfflineAreaCard = ({ zoomLevel, title, size }) => {
  const classes = useStyles()

  const lvlOfDetail = React.useMemo(() => {
    switch (true) {
      case zoomLevel <= 2:
        return m.lvlDetailGlobal
      case zoomLevel <= 4:
        return m.lvlDetailSubcontinent
      case zoomLevel <= 6:
        return m.lvlDetailLargeCountry
      case zoomLevel <= 8:
        return m.lvlDetailSmallCountry
      case zoomLevel <= 10:
        return m.lvlDetailLargeMetro
      case zoomLevel === 11:
        return m.lvlDetailCity
      case zoomLevel === 12:
        return m.lvlDetailTown
      case zoomLevel <= 14:
        return m.lvlDetailVillage
      case zoomLevel === 15:
        return m.lvlDetailSmallRoad
      case zoomLevel === 16:
        return m.lvlDetailStreet
      case zoomLevel === 17:
        return m.lvlDetailStreetBlock
      case zoomLevel === 18:
        return m.lvlDetailAddress
      case zoomLevel < 23:
        return m.lvlDetailStreetIntersection
      default:
        return m.lvlDetailGlobal
    }
  }, [zoomLevel])

  return (
    <Card className={classes.card}>
      <div></div>
      <div className={classes.cardOptions}>
        <IconButton></IconButton>
      </div>
      {lvlOfDetail}
    </Card>
  )
}

const useStyles = makeStyles({
  img: {
    width: '100%',
    objectFit: 'cover',
    height: '100%'
  },
  imgContainer: {
    width: '100%',
    height: '45%'
  },
  card: {
    display: 'flex'
  },
  cardOptions: {
    flexBasis: '20%'
  }
})
