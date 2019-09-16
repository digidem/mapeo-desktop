import React from 'react'
import ReactDOM from 'react-dom'
import { StylesProvider } from '@material-ui/styles'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import CssBaseline from '@material-ui/core/CssBaseline'

import Home from './components/HomeNew'
addLocaleData(enLocaleData)

const locale = navigator.language.slice(0, 2)

const App = () => (
  <StylesProvider injectFirst>
    <CssBaseline />
    <IntlProvider locale={locale}>
      <Home />
    </IntlProvider>
  </StylesProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))

let localStorage = window.localStorage
window.testMode = function () {
  console.log('Test mode, clearing cache')
  localStorage.removeItem('lastView')
  localStorage.removeItem('location')
}
