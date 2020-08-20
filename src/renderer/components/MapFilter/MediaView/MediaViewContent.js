// @flow
import React, { useMemo } from 'react'

import ImageGrid from './ImageGrid'
import { isImageAttachment } from '../utils/helpers'
import type { CommonViewContentProps } from '../types'

/**
 * Displays a grid of all photos attached to observations.
 */
const MediaViewContent = ({
  observations,
  onClick,
  getMedia
}: CommonViewContentProps) => {
  const images = useMemo(() => {
    const images = []
    const sortedObservations = observations.sort((a, b) => {
      return a.created_at > b.created_at
        ? -1
        : a.created_at < b.created_at
        ? 1
        : 0
    })
    for (const obs of sortedObservations) {
      const attachments = obs.attachments || []
      for (let i = 0; i < attachments.length; i++) {
        // Only return attachments with images
        if (!isImageAttachment(attachments[i])) continue
        // check we can actually get an image src for each one before adding it
        const media = getMedia(attachments[i], { width: 200, height: 200 })
        if (media)
          images.push({
            index: i,
            src: media.src,
            observationId: obs.id
          })
      }
    }
    return images
  }, [observations, getMedia])

  return <ImageGrid images={images} onImageClick={onClick} />
}

export default MediaViewContent
