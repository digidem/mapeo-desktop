// @flow
import React from 'react'

import Image from './Image'

export default {
  title: 'internal/Image'
}

export const defaultStory = () => (
  <Image
    style={{ width: 600, height: 400, backgroundColor: 'black' }}
    src='http://lorempixel.com/1920/1920/nature/3/'
  />
)

defaultStory.story = {
  name: 'default'
}
