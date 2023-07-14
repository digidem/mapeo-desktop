import React, { useState } from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import { AboutMapeoMenu } from './AboutMapeo'
import styled from 'styled-components'

const m = defineMessages({
  aboutMapeo: 'About Mapeo',
  aboutMapeoSubtitle: 'Version and build number'
})

const tabs = [
  {
    /** @type {import('./SettingsMenu').tabId} */
    tabId: 'AboutMapeo',
    icon: InfoIcon,
    label: m.aboutMapeo,
    subtitle: m.aboutMapeoSubtitle
  }
]

export const SettingsView = () => {
  /** @type {import('./SettingsMenu').tabId | null} */
  const initialMenuState = /** {const} */ null
  const [menuItem, setMenuItem] = useState(initialMenuState)

  return (
    <Container>
      <SettingsMenu tabs={tabs} currentTab={menuItem} onTabChange={setMenuItem} />
      {menuItem === 'AboutMapeo' && <AboutMapeoMenu />}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
`
