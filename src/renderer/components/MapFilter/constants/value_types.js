// @flow

/**
 * These values are used to choose the field type displayed for editing the
 * value, and are used for validation, e.g. a `uuid` field should be unique
 * across the dataset.
 */
export const STRING: 'string' = 'string'
export const BOOLEAN: 'boolean' = 'boolean'
export const NUMBER: 'number' = 'number'
export const DATE: 'date' = 'date'
export const DATETIME: 'datetime' = 'datetime'
export const URL: 'url' = 'url'
export const IMAGE_URL: 'image' = 'image'
export const VIDEO_URL: 'video' = 'video'
export const AUDIO_URL: 'audio' = 'audio'
export const ARRAY: 'array' = 'array'
export const LOCATION: 'location' = 'location'
export const UNDEFINED: 'undefined' = 'undefined'
export const NULL: 'null' = 'null'
