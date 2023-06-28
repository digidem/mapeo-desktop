import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import InfoIcon from '@material-ui/icons/Info'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import { AboutMapeoMenu } from './AboutMapeo'

const m = defineMessages({
  aboutMapeo: 'About Mapeo'
})

const tabs = /** @typedef {const} */ [
  {
    tabId: 'AboutMapeo',
    icon: InfoIcon,
    label: m.aboutMapeo,
    subtitle: 'Version and build number'
  }
]

export const SettingsView = () => {
  const [menuItem, setMenuItem] = useState(null)

  console.log({ menuItem })

  return (
    <div>
      <SettingsMenu
        tabs={tabs}
        currentTab={menuItem}
        onTabChange={setMenuItem}
      />

      {menuItem === 'AboutMapeo' && (
        <Paper>
          <AboutMapeoMenu />
        </Paper>
      )}
    </div>
  )
}
