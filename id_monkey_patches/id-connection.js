;(function (original) {
  iD.Connection = function () {
    var res = original.apply(this, arguments)
    res.userDetails = function (cb) {
      cb(null, {
        id: 'anonymous'
      })
    }
    return res
  }
})(iD.Connection)
