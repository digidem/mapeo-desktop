// @ts-check
import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core'

/** @typedef {{tabId:import('.').SettingTabId, icon:(string | React.ReactElement<any, string | React.JSXElementConstructor<any>>), label:import('react-intl').MessageDescriptor}} SettingsTabs */

/**
 * @typedef SettingMenuProp
 * @prop {SettingsTabs[]} tabs
 * @prop {SettingsTabs['tabId'] | false} currentTab
 * @prop {React.Dispatch<React.SetStateAction<false | SettingsTabs['tabId']>>} setCurrentTab
 */

/** @param {SettingMenuProp} props */
export const SettingsMenu = ({ tabs, currentTab, setCurrentTab }) => {
  const { formatMessage: t } = useIntl()

  const classes = useStyles()

  return (
    <Tabs
      orientation='vertical'
      value={currentTab}
      onChange={(e, newValue) => setCurrentTab(newValue)}
    >
      {tabs.map(tab => (
        <Tab
          className={classes.tab}
          label={t(tab.label)}
          key={tab.tabId}
          value={tab.tabId}
          icon={tab.icon}
        />
      ))}
    </Tabs>
  )
}

const useStyles = makeStyles({
  tab: {
    textTransform: 'none',
    '& .MuiTab-wrapper > *:first-child': {
      marginBottom: 0
    }
  }
})
