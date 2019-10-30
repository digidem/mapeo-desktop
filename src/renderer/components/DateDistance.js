import React from 'react'
import { FormattedDate, FormattedRelativeTime } from 'react-intl'

// We use relative dates for anything within the last 7 days, and then absolute
// dates for anything else.
const USE_WORDS_WITHIN_SECONDS = 4 * 24 * 60 * 60 // 4 days
const MINUTE = 60
const HOUR = 60 * 60
const DAY = 60 * 60 * 24

const DateDistance = ({ date = new Date(), style }) => {
  // Round distance to nearest 10 seconds
  const distanceInSeconds = Math.floor((Date.now() - date) / 10000) * 10

  const absValue = Math.abs(distanceInSeconds)

  if (absValue > USE_WORDS_WITHIN_SECONDS) {
    return (
      <FormattedDate
        value={date}
        day='numeric'
        month='long'
        year='numeric'
        hour='2-digit'
        minute='2-digit'
      />
    )
  } else if (absValue < MINUTE) {
    return (
      <FormattedRelativeTime
        value={-distanceInSeconds}
        numeric='auto'
        updateIntervalInSeconds={5}
      />
    )
  } else if (absValue < HOUR) {
    return (
      <FormattedRelativeTime
        value={-Math.round(distanceInSeconds / MINUTE)}
        unit='minute'
        updateIntervalInSeconds={30}
      />
    )
  } else if (absValue < DAY) {
    return (
      <FormattedRelativeTime
        value={-Math.round(distanceInSeconds / HOUR)}
        unit='hour'
      />
    )
  } else {
    return (
      <FormattedRelativeTime
        value={-Math.round(distanceInSeconds / DAY)}
        unit='day'
      />
    )
  }
}

export default DateDistance
