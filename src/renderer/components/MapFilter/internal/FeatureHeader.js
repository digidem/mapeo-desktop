//
import * as React from 'react'
import CardHeader from '@material-ui/core/CardHeader'
import { makeStyles } from '@material-ui/core/styles'
import { FormattedTime, FormattedMessage } from 'react-intl'

import PlaceIcon from '@material-ui/icons/Place'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'

import FormattedLocation from '../internal/FormattedLocation'
import msgs from '../messages'

const useStyles = makeStyles({
  avatar: {
    width: 50,
    height: 50,
    fontSize: 24,
    fontWeight: 500
  },
  action: {
    alignSelf: 'center',
    margin: 0
  }
})

const FeatureHeader = ({
  iconLabel,
  iconColor = '#cccccc',
  name,
  coords,
  createdAt,
  action
}) => {
  const classes = useStyles()
  const subheaderParts = []
  if (createdAt)
    subheaderParts.push(
      <FormattedTime
        key='time'
        value={createdAt}
        year='numeric'
        month='long'
        day='2-digit'
      />
    )
  if (coords) {
    if (subheaderParts.length) subheaderParts.push(' \u2014 ')
    subheaderParts.push(<FormattedLocation key='location' {...coords} />)
  }

  return (
    <CardHeader
      classes={{ action: classes.action }}
      avatar={
        <Avatar
          aria-label='Recipe'
          style={{ backgroundColor: iconColor }}
          className={classes.avatar}
        >
          {iconLabel || <PlaceIcon fontSize='large' />}
        </Avatar>
      }
      action={action}
      title={
        <Typography variant='h5' component='h2'>
          {name || <FormattedMessage {...msgs.defaultObservationName} />}
        </Typography>
      }
      subheader={subheaderParts}
    />
  )
}

export default FeatureHeader
