// @ts-check
import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useIntl } from 'react-intl'

/** @typedef {{tabId:string, icon:(string | React.ReactElement<any, string | React.JSXElementConstructor<any>>), label:import('react-intl').MessageDescriptor}} SettingsTabs */

/**
 * @typedef SettingMenuProp
 * @prop {SettingsTabs[]} tabs
 * @prop {string | false} currentTab
 * @prop {React.Dispatch<React.SetStateAction<boolean>>} setCurrentTab
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
          label={t(tab.label)}
          key={tab.tabId}
          value={tab.tabId}
          icon={tab.icon}
        />
      ))}
    </Tabs>
  )
}
