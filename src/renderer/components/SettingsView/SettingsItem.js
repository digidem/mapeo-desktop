import React, { useEffect } from 'react'

import { Typography, useTheme } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'

const m = defineMessages({
  on: 'On',
  off: 'Off',
})

export const SettingsItem = React.forwardRef(
  ({ type, label, subtitle, icon: Icon, active, onClick, ...rest }, ref) => {
    const theme = useTheme()
    const { formatMessage: t } = useIntl()

    return (
      <WrapperRow ref={ref} onClick={onClick} {...rest}>
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
            {type === 'toggle' ? <ToggleSubtitle on={active} /> : <Subtitle label={subtitle} />}
          </Typography>
        </TitleContainer>
        {type === 'menuItem' && <ChevronRightIcon style={{ opacity: active ? 1 : 0 }} />}
      </WrapperRow>
    )
  },
)

const Subtitle = ({ label }) => {
  const { formatMessage: t } = useIntl()
  return typeof label === 'string' ? label : t(label)
}

const ToggleSubtitle = ({ on }) => {
  const { formatMessage: t } = useIntl()

  return t(on ? m.on : m.off)
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
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
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
