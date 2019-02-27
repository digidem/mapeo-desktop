var mock = require('mock-data')

module.exports = function (count, bounds, cb) {
  if (!cb && typeof bounds === 'function') {
    cb = bounds
    bounds = [-78.3155, -3.3493, -74.9871, 0.6275]
    bounds = bounds.map((b) => b * 100)
  }
  mock.generate({
    type: 'integer',
    count: count,
    params: { start: bounds[0], end: bounds[2] }
  }, function (err, lons) {
    if (err) return cb(err)
    mock.generate({
      type: 'integer',
      count: count,
      params: { start: bounds[1], end: bounds[3] }
    }, function (err, lats) {
      if (err) return cb(err)
      lons.forEach((lon, i) => {
        var obs = {
          type: 'observation',
          lat: lats[i] / 100,
          lon: lon / 100,
          tags: {
            notes: '',
            observedBy: 'you'
          }
        }
        cb(null, obs)
      })
    })
  })
}
