/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import SyncAppBar from './SyncAppBar'

export default {
  title: 'Sync/App Bar',
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
          backgroundColor: '#efefef'
        }}
      >
        {storyFn()}
      </div>
    )
  ]
}

export const standard = () => <SyncAppBar />
