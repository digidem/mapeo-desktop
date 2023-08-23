import React, { Suspense } from 'react'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Transition } from 'react-transition-group'
import LocationOn from '@material-ui/icons/LocationOn'
import MapIcon from '@material-ui/icons/Map'
import ObservationIcon from '@material-ui/icons/PhotoLibrary'
import SyncIcon from '@material-ui/icons/OfflineBolt'
import SettingsIcon from '@material-ui/icons/Settings'
import WarningIcon from '@material-ui/icons/Warning'

import LatLonDialog from './dialogs/LatLon'
import ErrorDialog from './dialogs/Error'
import ChangeLanguage from './dialogs/ChangeLanguage'
import TitleBarShim from './TitleBarShim'
import { defineMessages, useIntl } from 'react-intl'
import SyncView from './SyncView'
import { STATES as updateStates, UpdaterView, UpdateTab } from './UpdaterView'
import { SettingsView } from './SettingsView'

import useUpdater from './UpdaterView/useUpdater'
import Loading from './Loading'
import buildConfig from '../../build-config'
import { usePersistedUiStore } from '../hooks/store'

const MapFilter = React.lazy(() =>
  import(
    /* webpackPrefetch: true */
    /* webpackChunkName: 'map-filter' */
    './MapFilter'
  )
)

const MapEditor = React.lazy(() =>
  import(
    /* webpackPrefetch: true */
    /* webpackChunkName: 'map-editor' */
    './MapEditor'
  )
)

const m = defineMessages({
  // MapEditor tab label
  mapeditor: 'Territory',
  // MapFilter tab label
  mapfilter: 'Observations',
  // Synchronize tab label
  sync: 'Synchronize',
  // Settings tab label
  settings: 'Settings',
  update: 'Update Mapeo'
})

// const MapEditor = () => <div>MAPEDITOR</div>

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
  background-color: ${buildConfig.variant === 'icca' ? '#63A25C' : '#000033'};
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
  h2 {
    font-family: 'Rubik', sans-serif;
    font-weight: 300;
    font-size: 1em;
    cursor: default;
    margin: 0;
    line-height: 0.9;
  }
`

const MapeoIcon = styled(LocationOn)`
  margin-right: 3.5px;
  margin-left: -5.5px;
`

const StyledTabs = styled(Tabs)`
  height: 100%;

  border-right: 1px solid rgba(0, 0, 0, 0.12);
  -webkit-app-region: no-drag;
  .PrivateTabIndicator-root-1 {
    background-color: #ff9933;
  }

  .MuiTabs-flexContainerVertical {
    height: 100%;
  }
`

const StyledTab = styled(Tab)`
  &.MuiTab-root {
    padding: 6px 24px 6px 18px;
    min-height: 64px;
    font-size: 16px;
    line-height: 28px;
    font-weight: 400;
    text-transform: capitalize;
  }
  &.Mui-selected {
    background-color: ${buildConfig.variant === 'icca' ? '#5a7f4e' : '#33335c'};
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

const LoadingContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: white;
`

const focusStates = {
  entering: 'focusing',
  entered: 'focused',
  exiting: 'blurring',
  exited: 'blurred'
}

function TabPanel(props) {
  const {
    value,
    index,
    unmountOnExit = false,
    component: Component,
    ...extras
  } = props
  // Don't render the tab content until the user has switched to the tab
  const lazy = React.useRef(value !== index)
  if (value === index) lazy.current = false

  const transitionStyles = {
    entering: { opacity: 1, zIndex: 1, display: 'block' },
    entered: { opacity: 1, zIndex: 1, display: 'block' },
    exiting: { opacity: 0 },
    exited: { opacity: 0, display: 'block' }
  }

  return Component && !lazy.current ? (
    <Suspense
      fallback={
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      }
    >
      <Transition
        in={value === index}
        timeout={transitionDuration}
        unmountOnExit={unmountOnExit}
      >
        {transitionState => (
          <StyledPanel style={transitionStyles[transitionState]}>
            <Component focusState={focusStates[transitionState]} {...extras} />
          </StyledPanel>
        )}
      </Transition>
    </Suspense>
  ) : null
}

export default function Home ({ onSelectLanguage }) {
  const [dialog, setDialog] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [tabIndex, setTabIndex] = usePersistedUiStore(store => [
    store.tabIndex,
    store.setTabIndex
  ])
  const [update, setUpdate] = useUpdater()
  const { formatMessage: t } = useIntl()

  React.useEffect(() => {
    const openLatLonDialog = () => setDialog('LatLon')
    const openErrorDialog = (ev, error) => {
      console.log(error)
      setError(error)
    }
    const openChangeLangDialog = () => setDialog('ChangeLanguage')
    const refreshPage = () => window.location.reload()
    ipcRenderer.on('error', openErrorDialog)
    ipcRenderer.on('open-latlon-dialog', openLatLonDialog)
    ipcRenderer.on('change-language-request', openChangeLangDialog)
    ipcRenderer.on('force-refresh-window', refreshPage)
    return () => {
      ipcRenderer.removeListener('error', openErrorDialog)
      ipcRenderer.removeListener('open-latlon-dialog', openLatLonDialog)
      ipcRenderer.removeListener(
        'change-language-request',
        openChangeLangDialog
      )
      ipcRenderer.removeListener('force-refresh-window', openLatLonDialog)
    }
  }, [])

  const hasUpdate =
    update.state !== updateStates.IDLE &&
    update.state !== updateStates.UPDATE_NOT_AVAILABLE

  return (
    <Root>
      <Sidebar>
        <TitleBarShim />
        <Logo>
          <MapeoIcon fontSize='large' />
          <div>
            <h1>Mapeo</h1>
            {buildConfig.variant === 'icca' ? <h2>for ICCAs</h2> : null}
          </div>
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
          <StyledTab
            style={{ marginTop: 'auto' }}
            icon={<SettingsIcon />}
            label={t(m.settings)}
          />
          {hasUpdate && (
            <StyledTab
              icon={<WarningIcon />}
              label={<UpdateTab update={update} />}
            />
          )}
        </StyledTabs>
      </Sidebar>
      <TabContent>
        <TabPanel value={tabIndex} index={0} component={MapEditor} />
        <TabPanel value={tabIndex} index={1} component={MapFilter} />
        <TabPanel
          value={tabIndex}
          index={2}
          component={SyncView}
          unmountOnExit
        />
        <TabPanel value={tabIndex} index={3} component={SettingsView} />
        <TabPanel
          value={tabIndex}
          index={4}
          component={UpdaterView}
          update={update}
          setUpdate={setUpdate}
        />
      </TabContent>
      <ChangeLanguage
        open={dialog === 'ChangeLanguage'}
        onCancel={() => {
          setDialog(null)
        }}
        onSelectLanguage={lang => {
          onSelectLanguage(lang)
          setDialog(null)
        }}
      />
      <LatLonDialog
        open={dialog === 'LatLon'}
        onClose={() => setDialog(null)}
      />
      <ErrorDialog
        open={error !== null}
        message={error}
        onClose={() => setError(null)}
      />
    </Root>
  )
}
