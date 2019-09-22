/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { action } from '@storybook/addon-actions'
import SyncTarget from './SyncTarget'

export default {
  title: 'Sync/Sync Target',
  decorators: [storyFn => <div style={{ maxWidth: 300 }}>{storyFn()}</div>]
}

export const ready = () => (
  <SyncTarget
    status='ready'
    name='Custom device name'
    onClick={action('clicked')}
    lastCompleted={Date.now() - 2 * 60 * 60 * 1000}
  />
)

export const desktop = () => (
  <SyncTarget
    status='ready'
    deviceType='desktop'
    name='My Laptop'
    onClick={action('clicked')}
    lastCompleted={Date.now()}
  />
)

export const progress = () => {
  const [percent, setPercent] = React.useState(0)

  React.useEffect(
    () => {
      const id = setTimeout(
        () => {
          setPercent(p => (p + 5) % 105)
        },
        percent === 0 || percent === 100 ? 4000 : 200
      )
      return () => clearTimeout(id)
    },
    [percent]
  )

  const progress = {
    percent: percent / 100,
    dbSofar: Math.round((14567 * percent) / 100),
    dbTotal: 14567,
    mediaSofar: Math.round((507 * percent) / 100),
    mediaTotal: 507
  }

  return (
    <SyncTarget
      status='progress'
      progress={progress}
      onClick={action('clicked')}
    />
  )
}

export const complete = () => (
  <SyncTarget status='complete' onClick={action('clicked')} />
)

export const error = () => (
  <SyncTarget status='error' onClick={action('clicked')} />
)
