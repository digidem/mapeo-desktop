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

import MapEditor from './MapEditor'
import LatLonDialog from './dialogs/LatLon'
import TitleBarShim from './TitleBarShim'
import MapFilter from './MapFilter'

const transitionDuration = 100

const Root = styled.div`
  position: absolute;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  display: flex;
`

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  background-color: #000033;
  color: white;
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
`

function TabPanel (props) {
  const { children, value, index } = props

  const transitionStyles = {
    entering: { opacity: 1, visibility: 'visible' },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0, visibility: 'hidden' }
  }

  return (
    <Transition in={value === index} timeout={transitionDuration}>
      {state => (
        <StyledPanel style={transitionStyles[state]}>{children}</StyledPanel>
      )}
    </Transition>
  )
}

export default function Home () {
  const [dialog, setDialog] = React.useState()
  const [value, setValue] = React.useState(0)

  function closeDialog () {
    setDialog(null)
  }

  function handleChange (event, newValue) {
    setValue(newValue)
  }

  React.useEffect(() => {
    const lastView = localStorage.getItem('lastViewIndex')
    if (lastView) setValue(+lastView)
    const openLatLonDialog = () => setDialog('LatLon')
    ipcRenderer.on('open-latlon-dialog', openLatLonDialog)
    return () => {
      ipcRenderer.removeListener('open-latlon-dialog', openLatLonDialog)
    }
  }, [])

  React.useEffect(
    () => {
      localStorage.setItem('lastViewIndex', value)
    },
    [value]
  )

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
          value={value}
          onChange={handleChange}
        >
          <StyledTab icon={<MapIcon />} label='Territorio' />
          <StyledTab icon={<ObservationIcon />} label='Observaciones' />
          <StyledTab icon={<SyncIcon />} label='Sincronizar' />
        </StyledTabs>
      </Sidebar>
      <TabContent>
        <TabPanel value={value} index={0}>
          <MapEditor />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MapFilter />
        </TabPanel>
      </TabContent>
      <LatLonDialog open={dialog === 'LatLon'} onClose={closeDialog} />
    </Root>
  )
}
