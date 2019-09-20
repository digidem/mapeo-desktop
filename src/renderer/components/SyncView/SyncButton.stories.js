/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'

import { action } from '@storybook/addon-actions'
import SyncButton from './SyncButton'

export default {
  title: 'Sync/Sync Button'
}

export const ready = () => <SyncButton onClick={action('clicked')} />

export const progress = () => {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(
    () => {
      const id = setTimeout(
        () => {
          setProgress(p => (p + 5) % 100)
        },
        progress === 0 ? 2000 : 200
      )
      return () => clearTimeout(id)
    },
    [progress]
  )
  return (
    <SyncButton
      variant='progress'
      progress={progress}
      onClick={action('clicked')}
    />
  )
}

export const progressWaiting = () => (
  <SyncButton variant='progress' progress={0} onClick={action('clicked')} />
)

export const complete = () => (
  <SyncButton variant='complete' onClick={action('clicked')} />
)
