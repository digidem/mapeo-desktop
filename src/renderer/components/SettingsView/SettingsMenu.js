import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import styled from 'styled-components'
import { Paper } from '@material-ui/core'
import { SettingsItem } from './SettingsList'

/** @typedef {'AboutMapeo'| 'Experiments' | 'BackgroundMaps'} tabId */

/**
 * @typedef {object} tab
 * @prop {tabId} tab.tabId
 * @prop {string | import('react-intl').MessageDescriptor} tab.label
 * @prop {string | import('react-intl').MessageDescriptor} tab.subtitle
 * @prop {'menuItem' | 'toggle'} tab.type
 * @prop {import('@material-ui/core/OverridableComponent').OverridableComponent<import('@material-ui/core').SvgIconTypeMap<{}, "svg">>} tab.icon
 * @typedef SettingsMenuProps
 * @prop {tab[]} tabs
 * @prop {number} currentTab
 * @prop {(e: React.Dispatch<number>) => number} onTabChange
 */

/** @param {SettingsMenuProps} props */
export const SettingsMenu = ({ tabs, currentTab, onTabChange }) => {
  return (
    <Paper
      style={{
        minWidth: 300,
        height: '100vh',
        borderRadius: 0,
        zIndex: 1,
        position: 'relative'
      }}
    >
      <StyledTabs
        orientation='vertical'
        value={currentTab}
        onChange={(e, newValue) => onTabChange(newValue)}
      >
        {tabs.map(tab => (
          <Tab
            disableRipple
            orientation='vertical'
            key={tab.tabId}
            value={tab.tabId}
            component={RenderTab}
            tab={tab}
            active={tab.tabId === currentTab}
          />
        ))}
      </StyledTabs>
    </Paper>
  )
}

/**
 * @typedef RenderTabProps
 * @prop {tab} tab
 * @prop {number} currentTab
 * @prop {(e: React.Dispatch<number>) => number} onTabChange
 */
/** @param {RenderTabProps} props */
export const RenderTab = React.forwardRef(
  ({ tab: { icon, label, subtitle, type }, ...rest }, ref) => (
    <SettingsItem
      icon={icon}
      label={label}
      subtitle={subtitle}
      type={type || 'menuItem'}
      {...rest}
    />
  )
)

const StyledTabs = styled(Tabs)`
  height: 100vh;
  padding-top: 1em;
  & .MuiTabs-indicator {
    display: none;
  }

  & .MuiTab-root {
    max-width: 100%;
  }
`
