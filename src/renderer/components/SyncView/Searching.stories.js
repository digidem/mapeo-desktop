/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import Searching from './Searching'

export default {
  title: 'Sync/Searching status',
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
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {storyFn()}
      </div>
    )
  ]
}

export const standard = () => <Searching />
