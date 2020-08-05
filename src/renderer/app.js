import React from 'react'
import ReactDOM from 'react-dom'
import { remote, ipcRenderer } from 'electron'
import { StylesProvider, ThemeProvider } from '@material-ui/styles'
import { IntlProvider } from 'react-intl'
import isDev from 'electron-is-dev'
import CssBaseline from '@material-ui/core/CssBaseline'

import logger from '../logger'
import theme from './theme'
import Home from './components/Home'

if (!logger.configured) {
  logger.configure({
    label: 'renderer',
    userDataPath: remote.app.getPath('userData'),
    isDev
  })
  ipcRenderer.on('debugging', (ev, bool) => {
    logger.debugging(bool)
  })
}

const initialLocale = ipcRenderer.sendSync('get-locale') // navigator.language.slice(0, 2)

const msgs = {
  en: require('../../translations/en.json'),
  es: require('../../translations/es.json'),
  pt: require('../../translations/pt.json')
}

if (!logger.configured) {
  logger.configure({
    label: 'renderer',
    userDataPath: remote.app.getPath('userData'),
    isDev
  })
  ipcRenderer.on('debugging', (ev, bool) => {
    logger.debugging(bool)
  })
}

const App = () => {
  const [locale, setLocale] = React.useState(initialLocale)

  const handleLanguageChange = React.useCallback(lang => {
    ipcRenderer.send('set-locale', lang)
    setLocale(lang)
    // Ideally this would just re-render the app in the new locale, but the way
    // we squeeze iD editor into React and patch in React Components on top of
    // it, trying to call `id.ui().restart(locale)` causes problems, so we
    // refresh instead
    ipcRenderer.send('force-refresh-window')
  }, [])
  logger.info('Rendering', locale)

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IntlProvider locale={locale} messages={msgs[locale]}>
          <Home onSelectLanguage={handleLanguageChange} />
        </IntlProvider>
      </ThemeProvider>
    </StylesProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

const localStorage = window.localStorage
window.testMode = function () {
  logger.debug('Test mode, clearing cache')
  localStorage.removeItem('lastView')
  localStorage.removeItem('location')
}
