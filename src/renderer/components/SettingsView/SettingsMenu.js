import * as React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Paper, Typography } from '@material-ui/core'

export const SettingsMenu = ({ tabs, currentTab, onTabChange }) => {
  const { formatMessage: t } = useIntl()

  return (
    <Tabs
      orientation='vertical'
      value={currentTab}
      onChange={(e, newValue) => onTabChange(newValue)}
      style={{
        maxWidth: '300px'
      }}
    >
      {tabs.map((tab, index) => (
        <Tab
          orientation='vertical'
          key={tab.tabId}
          value={tab.tabId}
          component={RenderTab}
          tab={tab}
          active={tab.tabId === currentTab}
        />
      ))}
    </Tabs>
  )
}

const RenderTab = ({
  tab: { icon: Icon, label, subtitle },
  active,
  ...rest
}) => {
  const { formatMessage: t } = useIntl()

  console.log({ active, rest })

  return (
    <Paper {...rest}>
      <WrapperRow>
        <IconContainer>{Icon ? <Icon /> : null}</IconContainer>
        <TitleContainer>
          <Typography
            variant='body1'
            component='label'
            style={{
              textTransform: 'none',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            {t(label)}
          </Typography>
          <Typography
            variant='caption'
            component='label'
            style={{
              textTransform: 'none',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            {subtitle}
          </Typography>
        </TitleContainer>
      </WrapperRow>
    </Paper>
  )
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const WrapperRow = styled(Row)`
  padding: 10px;
  align-items: center;
`

const IconContainer = styled.div`
  flex: 1;
  padding: 10px;
  display: flex;
  align-items: center;
`

const TitleContainer = styled(Column)`
  justify-content: flex-start;
  flex: 8;
`
