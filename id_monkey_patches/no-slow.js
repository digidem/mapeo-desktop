var oldSetTimeout = setTimeout
window.setTimeout = function (fn, delay) {
  var src = fn.toString()
    .replace(/^function\s+\S*\([^\)]*\)\s*{/, '')
    .replace(/}\s*$/, '')
    .replace(/\s+/g, '')
  var slowfn0 = 'loading.close();context.flush();'
  var slowfn1 = 'callback(null,changeset_id);'
  if (delay === 2500 && (src === slowfn0 || src === slowfn1)) {
    return oldSetTimeout(fn, 50)
  } else return oldSetTimeout.apply(this, arguments)
}
