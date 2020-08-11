// @flow
import React from 'react'
import { action } from '@storybook/addon-actions'

import MediaView from './MediaView'
import fixtureObs from '../../../../../fixtures/observations.json'

export default {
  title: 'MediaView'
}

export const defaultStory = () => {
  function getMediaUrl (id) {
    const size = 400
    const idx = parseInt(id, 16)
    return `https://picsum.photos/id/${+idx % 80}/${size}/${size}`
  }
  return (
    <MediaView
      observations={fixtureObs}
      onUpdateObservation={action('update')}
      onDeleteObservation={action('delete')}
      getMediaUrl={getMediaUrl}
      apiUrl='http://localhost:5000/'
    />
  )
}

defaultStory.story = {
  name: 'default'
}
