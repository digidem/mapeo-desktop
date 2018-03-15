var i18n = require('../lib/i18n')

module.exports = function () {
  var content = document.getElementById('content')
  content.innerHTML = `<div class="row">
    <div class="col-md-8 col-md-offset-2">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h2 class="panel-title">${i18n('generating-indexes-title')}</h2>
        </div>
        <div class="panel-body">
          <p class="lead">
          ${i18n('generating-indexes-body')}
          </p>
          <div id="response" class="alert alert-info hidden" role="alert">
          </div>
        </div>
      </div>
    </div>
  </div>
  `
}
