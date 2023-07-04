import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import { AboutMapeoMenu } from './AboutMapeo'
import styled from 'styled-components'

const m = defineMessages({
  aboutMapeo: 'About Mapeo',
  aboutMapeoSubtitle: 'Version and build number'
})

const tabs = /** @typedef {const} */ [
  {
    tabId: 'AboutMapeo',
    icon: InfoIcon,
    label: m.aboutMapeo,
    subtitle: m.aboutMapeoSubtitle
  }
]

export const SettingsView = () => {
  const [menuItem, setMenuItem] = useState(tabs[0].tabId)

  return (
    <Container>
      <SettingsMenu
        tabs={tabs}
        currentTab={menuItem}
        onTabChange={setMenuItem}
      />

      {menuItem === 'AboutMapeo' && <AboutMapeoMenu />}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
`
