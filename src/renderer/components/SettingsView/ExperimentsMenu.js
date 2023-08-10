import React from 'react'
import { defineMessages } from 'react-intl'
import { Map as MapIcon } from '@material-ui/icons'
import { SettingsList } from './SettingsList'
import { useExperimentsFlagsStore } from '../../hooks/store'

const m = defineMessages({
  backgroundMaps: 'Background Maps'
})

export const ExperiementsMenu = () => {
  const [backgroundMaps, setBackgroundMaps] = useExperimentsFlagsStore(
    store => [store.backgroundMaps, store.setBackgroundMapsFlag]
  )

  console.log({ backgroundMaps, setBackgroundMaps })

  const toggleBackgroundMaps = () => {
    setBackgroundMaps(!backgroundMaps)
  }

  /** @type {import('./SettingsList').option[]} */
  const options = [
    {
      id: 'BackgroundMaps',
      icon: MapIcon,
      label: m.backgroundMaps,
      checked: backgroundMaps,
      onClick: toggleBackgroundMaps,
      type: 'toggle'
    }
  ]

  return <SettingsList options={options} />
}
