import * as valueTypes from '../../constants/value_types'
import { guessValueType, coerceValue } from './value_types'

const guessTestData = [
  ['a string', valueTypes.STRING],
  ['', valueTypes.STRING],
  [99, valueTypes.NUMBER],
  [0, valueTypes.NUMBER],
  [12.3523523, valueTypes.NUMBER],
  [undefined, valueTypes.UNDEFINED],
  [null, valueTypes.NULL],
  [true, valueTypes.BOOLEAN],
  [false, valueTypes.BOOLEAN],
  [['a', 'b'], valueTypes.ARRAY],
  [[65, 95], valueTypes.ARRAY],
  [['a', 2], valueTypes.ARRAY],
  [[true, false], valueTypes.ARRAY],
  ['http://example.com/', valueTypes.URL],
  ['https://example.com', valueTypes.URL],
  ['http://localhost', valueTypes.URL],
  ['http://localhost:8000/', valueTypes.URL],
  ['http://localhost:8000/file.doc', valueTypes.URL],
  ['http://localhost:8000/folder/', valueTypes.URL],
  ['http://127.0.0.1:8000/image.jpg', valueTypes.IMAGE_URL],
  [
    'https://s3.amazonaws.com/images.digital-democracy.org/mapfilter-sample/sample-6.jpg',
    valueTypes.IMAGE_URL
  ],
  ['http://127.0.0.1:8000/image.JPG', valueTypes.IMAGE_URL],
  ['http://127.0.0.1:8000/image.JPEG', valueTypes.IMAGE_URL],
  ['http://127.0.0.1:8000/video.mp4', valueTypes.VIDEO_URL],
  ['http://127.0.0.1:8000/audio.wav', valueTypes.AUDIO_URL],
  [new Date().toISOString(), valueTypes.DATETIME],
  ['2017-02-12', valueTypes.DATE]
]

test('guessValueType', function () {
  expect.assertions(guessTestData.length)
  guessTestData.forEach(function (input) {
    expect(guessValueType(input[0])).toBe(input[1])
  })
})

const coerceTestData = [
  ['a string', valueTypes.STRING, 'a string'],
  [12, valueTypes.STRING, '12'],
  [1.234, valueTypes.STRING, '1.234'],
  [true, valueTypes.STRING, 'yes'],
  [false, valueTypes.STRING, 'no'],
  [['foo', 'bar'], valueTypes.STRING, 'foo,bar'],
  [[], valueTypes.STRING, ''],
  [null, valueTypes.STRING, null],
  [undefined, valueTypes.STRING, undefined],
  ['99', valueTypes.NUMBER, 99],
  ['1.123', valueTypes.NUMBER, 1.123],
  ['1.123 miles', valueTypes.NUMBER, 1.123],
  [null, valueTypes.NUMBER, null],
  [undefined, valueTypes.NUMBER, undefined],
  [true, valueTypes.BOOLEAN, true],
  [false, valueTypes.BOOLEAN, false],
  ['yes', valueTypes.BOOLEAN, true],
  ['no', valueTypes.BOOLEAN, false],
  ['true', valueTypes.BOOLEAN, true],
  ['false', valueTypes.BOOLEAN, false],
  ['1', valueTypes.BOOLEAN, true],
  ['0', valueTypes.BOOLEAN, false],
  ['other', valueTypes.BOOLEAN, Error],
  [1, valueTypes.BOOLEAN, true],
  [0, valueTypes.BOOLEAN, false],
  [null, valueTypes.BOOLEAN, null],
  [undefined, valueTypes.BOOLEAN, undefined],
  [['a', 'b'], valueTypes.ARRAY, ['a', 'b']],
  ['a b', valueTypes.ARRAY, ['a', 'b']],
  [null, valueTypes.ARRAY, null],
  [undefined, valueTypes.ARRAY, undefined],
  ['http://example.com/', valueTypes.URL, 'http://example.com/'],
  [
    'http://127.0.0.1:8000/image.jpg',
    valueTypes.IMAGE_URL,
    'http://127.0.0.1:8000/image.jpg'
  ],
  [
    'http://127.0.0.1:8000/video.mp4',
    valueTypes.VIDEO_URL,
    'http://127.0.0.1:8000/video.mp4'
  ],
  [
    'http://127.0.0.1:8000/audio.wav',
    valueTypes.AUDIO_URL,
    'http://127.0.0.1:8000/audio.wav'
  ],
  ['66° 30′ 360″ N 32° 3′ 45″ W', valueTypes.LOCATION, [-32.0625, 66.6]],
  [[66.234, 12.5123], valueTypes.LOCATION, [66.234, 12.5123]],
  ['66W 12N', valueTypes.LOCATION, [-66, 12]],
  ['-77.23 2.24 10 200', valueTypes.LOCATION, [-77.23, 2.24]],
  ['-77.23 2.24 10', valueTypes.LOCATION, Error],
  [1561307131506, valueTypes.DATETIME, new Date(1561307131506)],
  ['not a date', valueTypes.DATETIME, Error],
  [
    '2019-06-23T16:25:31.506Z',
    valueTypes.DATETIME,
    new Date('2019-06-23T16:25:31.506Z')
  ],
  ['2017-02-12', valueTypes.DATE, new Date('2017-02-12T12:00:00Z')]
]

test('coerceTestData', function () {
  expect.assertions(coerceTestData.length)
  coerceTestData.forEach(function (input) {
    if (input[2] === Error) {
      expect(coerceValue.bind(null, input[0], input[1])).toThrow(
        'Cannot coerce ' +
          (JSON.stringify(input[0]) || '`undefined`') +
          ' to ' +
          input[1]
      )
    } else {
      expect(coerceValue(input[0], input[1])).toEqual(input[2])
    }
  })
})
