import React from 'react'
import ReactDOM from 'react-dom'
import {addLocaleData, IntlProvider} from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'

import Home from './components/Home'
addLocaleData(enLocaleData)

const locale = navigator.language.slice(0, 2)

const App = () => (
  <IntlProvider locale={locale}>
    <Home />
  </IntlProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))
