// @ts-check
import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useIntl } from 'react-intl'
import { Typography } from '@material-ui/core'

/** @typedef {import('.').SettingsTabs} SettingsTabs */

/**
 * @typedef SettingMenuProp
 * @prop {SettingsTabs[]} tabs
 * @prop {SettingsTabs['tabId'] | false} currentTab
 * @prop {React.Dispatch<React.SetStateAction<false | SettingsTabs['tabId']>>} setCurrentTab
 */

/** @param {SettingMenuProp} props */
export const SettingsMenu = ({ tabs, currentTab, setCurrentTab }) => {
  const { formatMessage: t } = useIntl()

  return (
    <Tabs
      orientation='vertical'
      value={currentTab}
      onChange={(e, newValue) => setCurrentTab(newValue)}
    >
      {tabs.map(tab => (
        <Tab
          style={{ textTransform: 'none' }}
          label={
            <MenuLabel header={t(tab.label)} subHeader={t(tab.subHeader)} />
          }
          key={tab.tabId}
          value={tab.tabId}
          icon={tab.icon}
        />
      ))}
    </Tabs>
  )
}

const MenuLabel = ({ header, subHeader }) => (
  <div>
    <Typography style={{ textAlign: 'start' }}>{header}</Typography>
    <Typography style={{ textAlign: 'start', fontSize: 13 }}>
      {subHeader}
    </Typography>
  </div>
)
