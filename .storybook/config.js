import React from 'react'
import { configure, addParameters, addDecorator } from '@storybook/react'
import { IntlProvider } from 'react-intl'
import { withI18n } from 'storybook-addon-i18n'
import { ThemeProvider } from '@material-ui/styles'
import theme from '../src/renderer/theme'

import '../static/css/base.css'

const messages = {
  en: require('../translations/en.json'),
  es: require('../translations/es.json'),
  pt: require('../translations/pt.json')
}

const MyIntlProvider = props => {
  return <IntlProvider {...props} messages={messages[props.locale]} />
}

addParameters({
  i18n: {
    provider: MyIntlProvider,
    providerProps: {
      textComponent: React.Fragment
    },
    supportedLocales: ['en', 'es', 'pt'],
    providerLocaleKey: 'locale'
  }
})

addDecorator(withI18n)

addDecorator(storyFn => (
  <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
))

// automatically import all files ending in *.stories.js
configure(require.context('../src/renderer', true, /\.stories\.js$/), module)
