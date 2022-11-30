// @ts-check

import React from 'react'
import { useMapServerQuery } from './useMapServerQuery'

export default function MapServerExample1 () {
  const { data: styles } = useMapServerQuery('/styles')
  const { data: style } = useMapServerQuery('/styles/abc')
  const invalid = useMapServerQuery('not_valid')

  if (!style || !styles) return null
  return (
    <div>
      {styles.length}
      <br />
      {style.version}
    </div>
  )
}
