import React, { useState } from 'react'
import { defineMessages } from 'react-intl'
import { Map as MapIcon } from '@material-ui/icons'
import { SettingsMenu } from './SettingsMenu'
import createPersistedState from '../../hooks/createPersistedState'

const m = defineMessages({
  backgroundMaps: 'Background Maps',
  on: 'On',
  off: 'Off',
})

export const useBackgroundMapsActive = createPersistedState('backgroundMapsActive')

export const ExperiementsMenu = () => {
  const [backgroundMapsActive, setBackgroundMapsActive] = useBackgroundMapsActive(false)
  const [menuItem, setMenuItem] = useState(null)

  const tabs = [
    {
      tabId: 'BackgroundMaps',
      icon: MapIcon,
      label: m.backgroundMaps,
      subtitle: backgroundMapsActive ? m.on : m.off,
      onClick: () => setBackgroundMapsActive(prev => !prev),
    },
  ]

  return <SettingsMenu tabs={tabs} currentTab={menuItem} onTabChange={setMenuItem} />
}
