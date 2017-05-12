const React = require('react')
const h = React.createElement
const ReactDOM = require('react-dom')
const {MuiThemeProvider} = require('material-ui/styles')
const {addLocaleData, IntlProvider} = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

const Home = require('./home')

addLocaleData(enLocaleData)
const locale = navigator.language.slice(0, 2)

ReactDOM.render(
  h(IntlProvider, {locale: locale},
    h(MuiThemeProvider, {},
      h(Home)
    )
  ), document.getElementById('root'))
