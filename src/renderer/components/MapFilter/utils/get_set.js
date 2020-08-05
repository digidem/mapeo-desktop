import { set as originalSet } from 'object-path-immutable'

import { isObj } from './helpers'

export function get(object, path, defaultValue) {
  if (typeof path === 'string') path = [path]
  if (!Array.isArray(path)) return object
  if (!isObj(object) || path.length === 0) {
    return defaultValue === undefined && path.length === 0
      ? object
      : defaultValue
  }

  if (!Object.prototype.propertyIsEnumerable.call(object, path[0])) {
    return defaultValue
  }

  return get(object[path[0]], path.slice(1), defaultValue)
}

export const set = originalSet
