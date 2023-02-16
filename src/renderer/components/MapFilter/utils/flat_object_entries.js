//
import { isObj } from './helpers'

function isArrayOfPrimitives (value) {
  return Array.isArray(value) && value.length && !value.some(isObj)
}

/**
 * Similar to Object.entries, but flattens an object and keys are arrays. Arrays
 * of primitives are *not* flattened.
 *
 * @example
 * flatObjectEntries({
 *   foo: { bar: 'qux' },
 *   hello: 'world',
 *   arr: ['biz', 'baz'],
 *   other: [{ foo: 'bar'}]
 * })
 * // [
 * //   [['foo', 'bar'], 'qux'],
 * //   [['hello'], 'world'],
 * //   [['arr'], ['biz', 'baz']],
 * //   [['other', 0, 'foo'], 'bar']
 * // ]
 */
export function flatObjectEntries (object) {
  var entries = []

  ;(function step (object, prev = [], currentDepth = 1) {
    const keys = Array.isArray(object)
      ? object.map((_, i) => i)
      : Object.keys(object)
    for (const key of keys) {
      const value = object[key]
      const newKey = prev.concat([key])

      if (isObj(value) && !isArrayOfPrimitives(value)) {
        step(value, newKey, currentDepth + 1)
      } else {
        entries.push([newKey, value])
      }
    }
  })(object)

  return entries
}
