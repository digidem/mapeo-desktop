import React from 'react'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Transition } from 'react-transition-group'
import {
  LocationOn,
  Map as MapIcon,
  PhotoLibrary as ObservationIcon,
  OfflineBolt as SyncIcon
} from '@material-ui/icons'

import pkg from '../../../package.json'
import MapEditor from './MapEditor'
import LatLonDialog from './dialogs/LatLon'
import TitleBarShim from './TitleBarShim'
import MapFilter from './MapFilter'
import { defineMessages, useIntl } from 'react-intl'
import createPersistedState from '../hooks/createPersistedState'
import SyncView from './SyncView'

const m = defineMessages({
  // MapEditor tab label
  mapeditor: 'Territory',
  // MapFilter tab label
  mapfilter: 'Observations',
  // Synchronize tab label
  sync: 'Synchronize'
})

const transitionDuration = 100

const Root = styled.div`
  position: absolute;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  display: flex;
  @media only print {
    display: block;
    height: auto;
    width: auto;
    overflow: visible;
  }
`

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  background-color: #000033;
  color: white;
  z-index: 99;
  @media only print {
    display: none;
  }
`

const Logo = styled.div`
  padding: 0 24px 0 18px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  height: 64px;
  h1 {
    font-family: 'Rubik', sans-serif;
    font-weight: 500;
    font-size: 2em;
    cursor: default;
    margin: 0;
  }
`

const MapeoIcon = styled(LocationOn)`
  margin-right: 3.5px;
  margin-left: -5.5px;
`

const StyledTabs = styled(Tabs)`
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  -webkit-app-region: no-drag;
`

const StyledTab = styled(Tab)`
  padding: 6px 24px 6px 18px;
  min-height: 64px;
  font-size: 1em;
  font-weight: 400;
  text-transform: capitalize;
  &.Mui-selected {
    background-color: #33335c;
  }
  & .MuiTab-wrapper {
    justify-content: flex-start;
    flex-direction: row;
  }
  & .MuiTab-wrapper > *:first-child {
    margin-bottom: 4px;
    margin-right: 11px;
  }
`

const TabContent = styled.div`
  position: relative;
  flex: 1;
`

const StyledPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity ${transitionDuration}ms ease-out;
  @media only print {
    position: relative;
    width: auto;
    height: auto;
  }
`

const Version = styled.div`
  align-self: flex-start;
  margin: auto 10px 10px 10px;
  font-size: 0.8rem;
  color: #aaaaaa;
`

const focusStates = {
  entering: 'focusing',
  entered: 'focused',
  exiting: 'blurring',
  exited: 'blurred'
}

function TabPanel (props) {
  const { value, index, component: Component } = props

  const transitionStyles = {
    entering: { opacity: 1, zIndex: 1, display: 'block' },
    entered: { opacity: 1, zIndex: 1, display: 'block' },
    exiting: { opacity: 0 },
    exited: { opacity: 0, display: 'block' }
  }

  return (
    <Transition in={value === index} timeout={transitionDuration}>
      {transitionState => (
        <StyledPanel style={transitionStyles[transitionState]}>
          {Component && <Component focusState={focusStates[transitionState]} />}
        </StyledPanel>
      )}
    </Transition>
  )
}

const useTabIndex = createPersistedState('currentView')

export default function Home () {
  const [dialog, setDialog] = React.useState()
  const [tabIndex, setTabIndex] = useTabIndex(0)
  const { formatMessage: t } = useIntl()

  React.useEffect(() => {
    const openLatLonDialog = () => setDialog('LatLon')
    const refreshPage = () => window.location.reload()
    ipcRenderer.on('open-latlon-dialog', openLatLonDialog)
    ipcRenderer.on('force-refresh-window', refreshPage)
    return () => {
      ipcRenderer.removeListener('open-latlon-dialog', openLatLonDialog)
      ipcRenderer.removeListener('force-refresh-window', openLatLonDialog)
    }
  }, [])

  return (
    <Root>
      <Sidebar>
        <TitleBarShim />
        <Logo>
          <MapeoIcon fontSize='large' />
          <h1>Mapeo</h1>
        </Logo>
        <StyledTabs
          orientation='vertical'
          variant='scrollable'
          value={tabIndex}
          onChange={(e, value) => setTabIndex(value)}
        >
          <StyledTab icon={<MapIcon />} label={t(m.mapeditor)} />
          <StyledTab icon={<ObservationIcon />} label={t(m.mapfilter)} />
          <StyledTab icon={<SyncIcon />} label={t(m.sync)} />
        </StyledTabs>
        <Version>Mapeo v{pkg.version}</Version>
      </Sidebar>
      <TabContent>
        <TabPanel value={tabIndex} index={0} component={MapEditor} />
        <TabPanel value={tabIndex} index={1} component={MapFilter} />
        <TabPanel value={tabIndex} index={2} component={SyncView} />
      </TabContent>
      <LatLonDialog
        open={dialog === 'LatLon'}
        onClose={() => setDialog(null)}
      />
    </Root>
  )
}
