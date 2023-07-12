import React, { useState } from 'react'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import FlagIcon from '@material-ui/icons/Flag'
import MapIcon from '@material-ui/icons/Map'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import { AboutMapeoMenu } from './AboutMapeo'
import styled from 'styled-components'
import { ExperiementsMenu } from './ExperimentsMenu'
import createPersistedState from '../../hooks/createPersistedState'
import { BackgroundMaps } from './BackgroundMaps'

const m = defineMessages({
  aboutMapeo: 'About Mapeo',
  aboutMapeoSubtitle: 'Version and build number',
  experiments: 'Experiments',
  experimentsSubtitle: 'Turn on experimental new features',
  backgroundMaps: 'Background maps',
})

const useExperimentsFlagsState = createPersistedState('experimentsFlags')

export const SettingsView = () => {
  const [backgroundMaps, setBackgroundMaps] = useExperimentsFlagsState(false)
  const tabs = /** @type {import('./SettingsMenu').tabs} */[
    {
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
    ...(backgroundMaps
      ? [
        {
          tabId: 'BackgroundMaps',
          icon: MapIcon,
          label: m.backgroundMaps,
        },
      ]
      : []),
  ]
  const initialMenuState = /** {null | number} */ null
  const [menuItem, setMenuItem] = useState(initialMenuState)

  return (
    <Container>
      {menuItem === 'BackgroundMaps' ? (
        <BackgroundMaps returnToSettings={() => setMenuItem(initialMenuState)} />
      ) : (
        <>
          <SettingsMenu tabs={tabs} currentTab={menuItem} onTabChange={setMenuItem} />
          {menuItem === 'AboutMapeo' && <AboutMapeoMenu />}
          {menuItem === 'Experiments' && (
            <ExperiementsMenu backgroundMaps={backgroundMaps} setBackgroundMaps={setBackgroundMaps} />
          )}
        </>
      )}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
`
