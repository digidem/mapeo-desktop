// @ts-check
import * as React from 'react'
import { Card, makeStyles, Typography } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
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
  lvlDetailStreetIntersection: 'Street Intersection',
  // Abbreviation for megabytes
  mb: 'MB',
  // indicated zoom level
  zoomLevel: 'Zoom Level'
})

/**
 * @typedef OfflineAreaCardProps
 * @prop {number} zoomLevel
 * @prop {string} title
 * @prop {number} size
 */

/** @param {OfflineAreaCardProps} props */
export const OfflineAreaCard = ({ zoomLevel, title, size }) => {
  const classes = useStyles()
  const { formatMessage: t } = useIntl()

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
      <div className={classes.topContainer}>
        <Typography variant='body1'>{title}</Typography>
        <Typography variant='body1'>{`${size.toString()} ${t(
          m.mb
        )}`}</Typography>
      </div>
      <Typography style={{ flexBasis: '100%' }} variant='subtitle1'>{`${t(
        m.zoomLevel
      )}: ${zoomLevel.toString()}`}</Typography>
      <Typography style={{ flexBasis: '100%' }} variant='body2'>
        {t(lvlOfDetail)}
      </Typography>
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
    display: 'flex',
    flexWrap: 'wrap',
    flexBasis: '45%',
    minWidth: 225,
    height: 100,
    marginTop: 20,
    padding: '10px 5px'
  },
  topContainer: {
    flexBasis: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  }
})
