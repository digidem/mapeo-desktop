
module.exports = function (filename, index, total) {
  return `
    <div>${filename}: [${index}/${total}] ${index/total}</div>
  `
}
