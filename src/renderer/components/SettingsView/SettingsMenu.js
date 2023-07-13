import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useIntl } from 'react-intl'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import styled from 'styled-components'
import { Paper, Typography, useTheme } from '@material-ui/core'

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
        width: 300,
        height: '100vh',
        borderRadius: 0,
        zIndex: 1,
        position: 'relative',
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

const RenderTab = React.forwardRef(
  ({ tab: { icon: Icon, label, subtitle }, active, children, ...rest }, ref) => {
    const { formatMessage: t } = useIntl()
    const theme = useTheme()

    return (
      <WrapperRow ref={ref} {...rest}>
        <IconContainer>{Icon ? <Icon style={{ color: theme.palette.grey['600'] }} /> : null}</IconContainer>
        <TitleContainer>
          <Typography
            variant='body1'
            component='label'
            style={{
              textTransform: 'none',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {typeof label === 'string' ? label : t(label)}
          </Typography>
          <Typography
            variant='caption'
            component='label'
            style={{
              textTransform: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              color: theme.palette.grey['700'],
            }}
          >
            {typeof subtitle === 'string' ? subtitle : t(subtitle)}
          </Typography>
        </TitleContainer>
        <ChevronRightIcon style={{ opacity: active ? 1 : 0 }} />
      </WrapperRow>
    )
  },
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
