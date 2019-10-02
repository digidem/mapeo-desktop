/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'

// import MapFilter from '.'

export default {
  title: 'MapFilter',
  decorators: [
    storyFn => (
      <div style={{ width: '100vw', height: '100vh' }}>{storyFn()}</div>
    )
  ]
}

// export const defaultStory = () => {
//   return <MapFilter />
// }

// defaultStory.story = {
//   name: 'default'
// }
