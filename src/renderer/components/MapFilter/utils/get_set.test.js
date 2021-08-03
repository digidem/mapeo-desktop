import { get, set } from './get_set'

test('get', () => {
  const fixture1 = { foo: { bar: 1 } }
  expect(get(fixture1)).toBe(fixture1)
  fixture1[''] = 'foo'
  expect(get(fixture1, [''])).toBe('foo')
  expect(get(fixture1, ['foo'])).toBe(fixture1.foo)
  expect(get(fixture1, 'foo')).toBe(fixture1.foo)
  expect(get({ foo: 1 }, ['foo'])).toBe(1)
  expect(get({ foo: null }, ['foo'])).toBe(null)
  expect(get({ foo: undefined }, ['foo'])).toBe(undefined)
  expect(get({ foo: { bar: true } }, ['foo', 'bar'])).toBe(true)
  expect(get({ foo: { bar: { baz: true } } }, ['foo', 'bar', 'baz'])).toBe(true)
  expect(get({ foo: { bar: { baz: null } } }, ['foo', 'bar', 'baz'])).toBe(null)
  expect(get({ foo: { bar: 'a' } }, ['foo', 'fake'])).toBe(undefined)
  expect(get({ foo: { bar: 'a' } }, ['foo', 'fake', 'fake2'])).toBe(undefined)
  expect(
    get({ foo: { bar: 'a' } }, ['foo', 'fake', 'fake2'], 'some value')
  ).toBe('some value')
  expect(get({ '\\': true }, ['\\'])).toBe(true)
  expect(get({ '\\foo': true }, ['\\foo'])).toBe(true)
  expect(get({ 'bar\\': true }, ['bar\\'])).toBe(true)
  expect(get({ 'foo\\bar': true }, ['foo\\bar'])).toBe(true)
  expect(get({ foo: 1 }, ['foo', 'bar'])).toBe(undefined)

  const fixture2 = {}
  Object.defineProperty(fixture2, 'foo', {
    value: 'bar',
    enumerable: false
  })
  expect(get(fixture2, ['foo'])).toBe(undefined)
  expect(get({}, ['hasOwnProperty'])).toBe(undefined)

  function fn () {}
  fn.foo = { bar: 1 }
  expect(get(fn)).toBe(fn)
  expect(get(fn, ['foo'])).toBe(fn.foo)
  expect(get(fn, ['foo', 'bar'])).toBe(1)

  const f3 = { foo: null }
  expect(get(f3, ['foo', 'bar'])).toBe(undefined)
  expect(get(f3, ['foo', 'bar'], 'some value')).toBe('some value')

  expect(get({ 'foo.baz': { bar: true } }, ['foo.baz', 'bar'])).toBe(true)
  expect(get({ 'fo.ob.az': { bar: true } }, ['fo.ob.az', 'bar'])).toBe(true)

  expect(get(null, ['foo', 'bar'], false)).toBe(false)
  expect(get('foo', ['foo', 'bar'], false)).toBe(false)
  expect(get([], ['foo', 'bar'], false)).toBe(false)
  expect(get(undefined, ['foo', 'bar'], false)).toBe(false)

  expect(get({ foo: { bar: 'qux' } }, ['foo', 'bar'])).toBe('qux')
  expect(get({ foo: { bar: ['qux'] } }, ['foo', 'bar', 0])).toBe('qux')
  expect(get({ foo: { bar: ['qux'] } }, ['foo', 'bar', 2])).toBe(undefined)
  expect(get({ foo: { 'bar.qux': 'hello' } }, ['foo', 'bar.qux'])).toBe('hello')

  const nestedArr = ['baz', 'qux']
  expect(get({ foo: { bar: nestedArr } }, ['foo', 'bar'])).toBe(nestedArr)
  const nestedObj = { baz: true }
  expect(get({ foo: { bar: nestedObj } }, ['foo', 'bar'])).toBe(nestedObj)
})

test('set', () => {
  const fixture1 = { foo: { bar: 1 } }
  expect(set(fixture1, ['foo', 'bar'], 2)).toEqual({ foo: { bar: 2 } })
  expect(set(fixture1, 'quz', 2)).toEqual({ foo: { bar: 1 }, quz: 2 })
  expect(set(fixture1, ['foo', 'baz', 0], 2)).toEqual({
    foo: { bar: 1, baz: [2] }
  })
  expect(set(fixture1, ['foo', 'baz', 0], 'qux')).toEqual({
    foo: { bar: 1, baz: ['qux'] }
  })
})
