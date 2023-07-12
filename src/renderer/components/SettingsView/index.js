import React, { useState } from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import FlagIcon from '@material-ui/icons/Flag'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import { AboutMapeoMenu } from './AboutMapeo'
import styled from 'styled-components'
import { ExperiementsMenu } from './ExperimentsMenu'

const m = defineMessages({
  aboutMapeo: 'About Mapeo',
  aboutMapeoSubtitle: 'Version and build number',
  experiments: 'Experiments',
  experimentsSubtitle: 'Turn on experimental new features',
})

const tabs = /** @typedef {const} */[
  {
    /** @type {import('./SettingsMenu').tabId} */
    tabId: 'AboutMapeo',
    icon: InfoIcon,
    label: m.aboutMapeo,
    subtitle: m.aboutMapeoSubtitle,
  },
  {
    tabId: 'Experiments',
    icon: FlagIcon,
    label: m.experiments,
    subtitle: m.experimentsSubtitle,
  },
]

export const SettingsView = () => {
  /** @type {import('./SettingsMenu').tabId | null} */
  const initialMenuState = /** {const} */ null
  const [menuItem, setMenuItem] = useState(initialMenuState)

  return (
    <Container>
      <SettingsMenu tabs={tabs} currentTab={menuItem} onTabChange={setMenuItem} />
      {menuItem === 'AboutMapeo' && <AboutMapeoMenu />}
      {menuItem === 'Experiments' && <ExperiementsMenu />}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
`
