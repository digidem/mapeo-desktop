import { flatObjectEntries } from './flat_object_entries'

test('flatObjectEntries', () => {
  expect(
    flatObjectEntries({
      empty: {},
      emptyArr: [],
      foo: { bar: 'qux' },
      hello: 'world',
      arr: ['biz', 'baz'],
      other: [{ foo: 'bar' }, { qux: 'quz' }]
    })
  ).toEqual([
    [['foo', 'bar'], 'qux'],
    [['hello'], 'world'],
    [['arr'], ['biz', 'baz']],
    [['other', 0, 'foo'], 'bar'],
    [['other', 1, 'qux'], 'quz']
  ])
})
