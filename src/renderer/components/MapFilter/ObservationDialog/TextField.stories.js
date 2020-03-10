import * as React from 'react'

import TextField from './TextField'

export default {
  title: 'ObservationDialog/TextField'
  // decorators: [storyFn => <div style={{ padding: '10px 0' }}>{storyFn()}</div>]
}

export const defaultStory = () => (
  <TextField
    label="Select Country"
    placeholder="Select Country"
    helperText="The actual question might be here?"
  />
)

defaultStory.story = {
  name: 'default'
}
