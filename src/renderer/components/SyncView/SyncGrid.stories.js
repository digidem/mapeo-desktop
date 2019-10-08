/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { action } from '@storybook/addon-actions'
import SyncTarget from './SyncTarget'
import SyncGrid from './SyncGrid'

export default {
  title: 'Sync/Sync Grid',
  decorators: [
    storyFn => (
      <div
        style={{
          top: 0,
          left: 0,
          position: 'absolute',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'stretch'
        }}
      >
        {storyFn()}
      </div>
    )
  ]
}

export const single = () => (
  <SyncGrid>
    <SyncTarget
      status='ready'
      name='Custom device name'
      onClick={action('clicked')}
      lastCompleted={Date.now() - 2 * 60 * 60 * 1000}
    />
  </SyncGrid>
)

const defaults = {
  status: 'ready',
  name: 'Android Device',
  onClick: action('clicked'),
  lastCompleted: Date.now() - 2 * 60 * 60 * 1000
}

export const multiple = () => {
  const targets = Array(6).fill(defaults)
  return (
    <SyncGrid>
      {targets.map((target, idx) => (
        <SyncTarget
          key={idx}
          {...target}
          name={'My Device ' + idx}
          deviceType={Math.random() > 0.5 ? 'desktop' : 'mobile'}
          lastCompleted={Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000}
        />
      ))}
    </SyncGrid>
  )
}
