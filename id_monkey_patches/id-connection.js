;(function (original) {
  iD.Connection = function () {
    var res = original.apply(this, arguments)
    var originalSwitch = res.switch
    var url
    res.switch = function (options) {
      url = options.url
      return originalSwitch(options)
    }
    res.entityURL = function (entity) {
      return url + '/api/0.6/' + entity.type + '/' + entity.osmId()
    }
    res.userDetails = function (cb) {
      cb(null, {
        id: 'anonymous'
      })
    }
    return res
  }
})(iD.Connection)
