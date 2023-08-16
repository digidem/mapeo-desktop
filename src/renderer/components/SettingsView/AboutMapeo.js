import React from 'react'
import styled from 'styled-components'
import { Box, Typography, useTheme } from '@material-ui/core'
import { defineMessages, useIntl } from 'react-intl'
import buildConfig from '../../../build-config'

const m = defineMessages({
  mapeoVersion: 'Mapeo Version',
  mapeoVariant: 'Mapeo Variant',
})

export const AboutMapeoMenu = () => {
  const { formatMessage: t } = useIntl()
  return (
    <Container>
      <KeyValuePair label={t(m.mapeoVersion)} value={buildConfig.version}></KeyValuePair>
      <KeyValuePair label={t(m.mapeoVariant)} value={buildConfig.variant}></KeyValuePair>
    </Container>
  )
}

/**
 * @typedef KeyValuePairProps
 * @prop {string} label
 * @prop {string} value
 */

/** @param {KeyValuePairProps} props */
const KeyValuePair = ({ label, value }) => {
  const theme = useTheme()
  return (
    <Column>
      <Typography variant='body1' component='label' style={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant='caption' component='label' style={{ color: theme.palette.grey['700'] }}>
        {value}
      </Typography>
    </Column>
  )
}
const Container = styled(Box)`
  width: 100%;
  background-color: #fff;
  padding: 1.2em 1em 1em 2em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  &.MuiPaper-rounded {
    border-radius: 0;
  }
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1em;
`
