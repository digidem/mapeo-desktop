import React from 'react'
import { defineMessages } from 'react-intl'
import { Map as MapIcon } from '@material-ui/icons'
import { SettingsList } from './SettingsList'

const m = defineMessages({
  backgroundMaps: 'Background Maps',
})

/**
 * @typedef ExperiementsMenuProps
 * @prop {boolean} backgroundMaps
 * @prop {(e: React.Dispatch<boolean>) => number} setBackgroundMaps
 */

/** @param {ExperiementsMenuProps} props */
export const ExperiementsMenu = ({ backgroundMaps, setBackgroundMaps }) => {
  const toggleBackgroundMaps = () => {
    setBackgroundMaps(prevState => {
      return !prevState
    })
  }

  /** @type {import('./SettingsList').option[]} */
  const options = [
    {
      id: 'BackgroundMaps',
      icon: MapIcon,
      label: m.backgroundMaps,
      checked: backgroundMaps,
      onClick: toggleBackgroundMaps,
      type: 'toggle',
    },
  ]

  return <SettingsList options={options} />
}
