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
          setProgress(p => (p + 0.05) % 1.05)
        },
        progress === 0 || progress === 1 ? 4000 : 200
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

export const progressHalfway = () => (
  <SyncButton variant='progress' progress={0.5} onClick={action('clicked')} />
)

export const complete = () => (
  <SyncButton variant='complete' onClick={action('clicked')} />
)
