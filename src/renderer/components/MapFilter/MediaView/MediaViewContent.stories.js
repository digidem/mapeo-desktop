//
import React from 'react'
import { action } from '@storybook/addon-actions'

import MediaView from './MediaViewContent'
import fixtureObs from '../../../../../fixtures/observations.json'
import { defaultGetPreset } from '../utils/helpers'

export default {
  title: 'MediaView/Content'
}

export const defaultStory = () => {
  function getMedia ({ id }, { width = 200, height = 200 } = {}) {
    const size = Math.floor(width / 100) * 100
    const idx = parseInt(id, 16)
    return {
      src: `https://picsum.photos/id/${+idx % 80}/${size}/${size}`,
      type: 'image'
    }
  }
  return (
    <MediaView
      observations={fixtureObs}
      onClick={action('click')}
      getMedia={getMedia}
      getPreset={defaultGetPreset}
    />
  )
}

defaultStory.story = {
  name: 'default'
}
