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
  fr: require('../../translations/fr.json'),
  pt: require('../../translations/pt.json'),
  vi: require('../../translations/vi.json'),
  km: require('../../translations/km.json'),
  th: require('../../translations/th.json'),
  mn: require('../../translations/mn.json')
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
  const [backendState, setBackendState] = React.useState('loading')

  React.useEffect(() => {
    ipcRenderer
      .invoke('get-backend-state')
      .then(state => onStateChange(null, state))

    ipcRenderer.on('backend-state', onStateChange)

    function onStateChange (_, state) {
      const newState = getMergedStateValue(state)
      logger.debug('Backend state ' + newState, state)
      setBackendState(newState)
    }

    return () => ipcRenderer.off(onStateChange)
  }, [])

  React.useEffect(() => {
    // Let main process know when the first render is complete, so that it can
    // show this window and close the loading window
    if (backendState !== 'ready') return
    ipcRenderer.send('frontend-rendered')
  }, [backendState])

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

  return backendState === 'ready' ? (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IntlProvider locale={locale} messages={msgs[locale]}>
          <Home onSelectLanguage={handleLanguageChange} />
        </IntlProvider>
      </ThemeProvider>
    </StylesProvider>
  ) : null
}

ReactDOM.render(<App />, document.getElementById('root'))

const localStorage = window.localStorage
window.testMode = function () {
  logger.debug('Test mode, clearing cache')
  localStorage.removeItem('lastView')
  localStorage.removeItem('location')
}

function getMergedStateValue (state) {
  const values = Object.values(state).map(s => s.value)
  if (values.includes('error')) return 'error'
  if (values.includes('loading')) return 'loading'
  if (values.every(v => v === 'started')) return 'ready'
  return 'unknown'
}
