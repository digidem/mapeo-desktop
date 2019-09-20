import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl } from 'react-intl'
import { Typography } from '@material-ui/core'
import styled from 'styled-components'

const m = defineMessages({
  // Title on sync screen when searching for devices
  searchingTitle: 'Searching…',
  // Hint on sync screen when searching on wifi for devices
  searchingHint:
    'Make sure devices are turned on and connected to the same wifi network'
})

const Styled = styled.div`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
  div {
    position: absolute;
    top: 12px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 6px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  div:nth-child(2) {
    left: 6px;
    animation: lds-ellipsis2 0.6s infinite;
    background-color: rgba(0, 5, 43, 1);
  }
  div:nth-child(3) {
    left: 26px;
    background-color: rgba(0, 5, 43, 1);
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(4) {
    left: 45px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
      background-color: rgba(0, 5, 43, 0);
    }
    100% {
      transform: scale(1);
      background-color: rgba(0, 5, 43, 1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
      background-color: rgba(0, 5, 43, 1);
    }
    100% {
      transform: scale(0);
      background-color: rgba(0, 5, 43, 0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(19px, 0);
    }
  }
`

const Loader = () => (
  <Styled>
    <div />
    <div />
    <div />
    <div />
  </Styled>
)

const Searching = () => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  return (
    <div className={cx.searchingWrapper}>
      <div className={cx.searching}>
        <Loader />
        <div className={cx.searchingText}>
          <Typography gutterBottom variant='h2' className={cx.searchingTitle}>
            {t(m.searchingTitle)}
          </Typography>

          <Typography>{t(m.searchingHint)}</Typography>
        </div>
      </div>
    </div>
  )
}

export default Searching

const useStyles = makeStyles(theme => ({
  searchingText: {
    maxWidth: 300,
    marginLeft: theme.spacing(2)
  },
  searchingWrapper: {
    backgroundColor: '#EAEAEA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'stretch',
    justifySelf: 'stretch'
  },
  searching: {
    color: '#00052b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  searchingTitle: {
    fontSize: '2em',
    fontWeight: 400
  }
}))
