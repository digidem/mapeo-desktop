import React from 'react'
import ReactDOM from 'react-dom'
import { StylesProvider, ThemeProvider } from '@material-ui/styles'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'

import Home from './components/HomeNew'
addLocaleData(enLocaleData)

const locale = navigator.language.slice(0, 2)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0066FF'
    },
    secondary: {
      main: '#FF9933'
    }
  }
})

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
