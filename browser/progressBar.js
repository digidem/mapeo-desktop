
module.exports = function (filename, index, total) {
  return `
    <div class="progress-bar-wrapper">
      ${filename}:
      <div class="bar">
        <div class="progress" style="height:24px;width:${Math.round((index/total)*100)}%"></div>
      </div>
    </div>
  `
}
