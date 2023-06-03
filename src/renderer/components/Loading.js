import React from 'react'
import { defineMessages, useIntl } from 'react-intl'

import Loader from './Loader'
import CenteredText from './CenteredText'

const m = defineMessages({
  // Displayed whilst observations and presets load
  loading: {
    id: 'renderer.components.Loading.loading',
    defaultMessage: 'Loading…'
  }
})

const Searching = () => {
  const { formatMessage: t } = useIntl()
  return <CenteredText text={t(m.loading)} icon={<Loader />} />
}

export default Searching
