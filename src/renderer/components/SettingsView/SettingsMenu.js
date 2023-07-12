import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import styled from 'styled-components'
import { Paper } from '@material-ui/core'
import { SettingsItem } from './SettingsItem'

/** @typedef {'AboutMapeo'} tabId */

/**
 * @typedef {object} tab
 * @prop {tabId} tab.tabId
 * @prop {string | import('react-intl').MessageDescriptor} tab.label
 * @prop {string | import('react-intl').MessageDescriptor} tab.subtitle
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
        {
          tabs.map(tab => (
            <Tab
              disableRipple
              orientation='vertical'
              key={tab.tabId}
              value={tab.tabId}
              component={RenderTab}
              tab={tab}
              active={tab.tabId === currentTab}
            />
          ))
        }
      </StyledTabs >
    </Paper >
  )
}

export const RenderTab = React.forwardRef(({ tab: { icon, label, subtitle }, ...rest }, ref) => (
  <SettingsItem icon={icon} label={label} subtitle={subtitle} type='menuItem' {...rest} />
))

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

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const WrapperRow = styled(Row)`
  padding: 20px;
  align-items: center;
  justify-content: space-between;
`

const IconContainer = styled.div`
  flex: 1;
  padding: 10px 30px 10px 10px;
  display: flex;
  align-items: center;
`

const TitleContainer = styled(Column)`
  justify-content: flex-start;
  flex: 8;
`
