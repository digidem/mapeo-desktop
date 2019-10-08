import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'

const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
// We use relative dates for anything within the last 7 days, and then absolute
// dates for anything else.
const USE_WORDS_WITHIN = 7 * 24 * 60 * 60 * 1000 // 7 days

const DateDistance = ({ date = Date.now() }) => {
  const { formatRelativeTime, formatDate } = useIntl()
  const [distance, setDistance] = useState(Date.now() - date)

  useEffect(
    () => {
      if (distance > day) return
      const timeout = distance < hour ? 30 * second : hour
      const timeoutId = setTimeout(() => {
        setDistance(Date.now() - date)
      }, timeout)
      return () => clearTimeout(timeoutId)
    },
    [date, distance]
  )

  let text
  if (distance < minute) {
    text = 'ahorita'
  } else if (distance <= hour) {
    text = formatRelativeTime(Math.round(-distance / minute), 'minute', {
      numeric: 'auto'
    })
  } else if (distance <= day) {
    text = formatRelativeTime(Math.round(-distance / hour), 'hour', {
      numeric: 'auto'
    })
  } else if (distance <= USE_WORDS_WITHIN) {
    text = formatRelativeTime(Math.round(-distance / day), 'day', {
      numeric: 'auto'
    })
  } else {
    text = formatDate(date)
  }
  return text
}

export default DateDistance
