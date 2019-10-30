import React from 'react'
import ReactDOM from 'react-dom'
import { StylesProvider, ThemeProvider } from '@material-ui/styles'
import { IntlProvider } from 'react-intl'
import CssBaseline from '@material-ui/core/CssBaseline'

import theme from './theme'
import Home from './components/Home'

const locale = navigator.language.slice(0, 2)

const mdMsgs = {
  en: require('../../translations/en.json'),
  es: require('../../translations/es.json'),
  pt: require('../../translations/pt.json')
}

const mfMsgs = {
  en: require('react-mapfilter/translations/en.json'),
  es: require('react-mapfilter/translations/es.json'),
  pt: require('react-mapfilter/translations/pt.json')
}

const allMsgs = {
  en: { ...mdMsgs.en, ...mfMsgs.en },
  es: { ...mdMsgs.es, ...mfMsgs.es },
  pt: { ...mdMsgs.pt, ...mfMsgs.pt }
}

const App = () => (
  <StylesProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IntlProvider locale={locale} messages={allMsgs[locale]}>
        <Home />
      </IntlProvider>
    </ThemeProvider>
  </StylesProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))

const localStorage = window.localStorage
window.testMode = function () {
  console.log('Test mode, clearing cache')
  localStorage.removeItem('lastView')
  localStorage.removeItem('location')
}
