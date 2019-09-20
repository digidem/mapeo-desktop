import React from 'react'
import ReactDOM from 'react-dom'
import { StylesProvider, ThemeProvider } from '@material-ui/styles'
import { IntlProvider } from 'react-intl'
import CssBaseline from '@material-ui/core/CssBaseline'

import theme from './theme'
import Home from './components/HomeNew'

const locale = navigator.language.slice(0, 2)

const App = () => (
  <StylesProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IntlProvider locale={locale}>
        <Home />
      </IntlProvider>
    </ThemeProvider>
  </StylesProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))

let localStorage = window.localStorage
window.testMode = function () {
  console.log('Test mode, clearing cache')
  localStorage.removeItem('lastView')
  localStorage.removeItem('location')
}
