// @ts-check
import * as React from 'react'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
// import MapIcon from '@material-ui/icons/MapOutlined'
import InfoIcon from '@material-ui/icons/InfoOutlined'
// import { BGMaps } from './BGMaps'
import { makeStyles } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'
import { ProjectConfig } from './ProjectConfig'
import { SettingsProvider } from './SettingsContext'

const m = defineMessages({
  // Setting menu option: Background maps
  backgroundMap: 'Background Map',
  // Setting menu option: About Mapeo
  aboutMapeo: 'About Mapeo',
  // Setting menu option: Project Configuration
  projConfig: 'Project Configuration'
})

const FADE_DURATION = 700

/** @typedef {import('./SettingsMenu').SettingsTabs} SettingsTabs */

// This is for strong typing of the props for the SettingsMenu component tab values
// We could dynamically build this with `as const` if we upgraded typescript
/** @typedef {'ProjConfig'} SettingTabId */

/** @type {SettingsTabs[]} */
const tabs = /** @typedef {const} */ [
  // {
  //   tabId: 'BackgroundMap',
  //   icon: <MapIcon />,
  //   label: m.backgroundMap
  // },
  // {
  //   tabId: 'AboutMapeo',
  //   icon: <InfoIcon />,
  //   label: m.aboutMapeo
  // },
  {
    tabId: 'ProjConfig',
    icon: <InfoIcon />,
    label: m.projConfig
  }
]

/**
 * @typedef SettingsProp
 * @prop {boolean} reset
 * @prop {function(boolean):void} setReset
 * @prop {boolean} fadeIn
 * @prop {boolean} practiceModeOn
 * @prop {string|null} invite
 */

/** @param {SettingsProp} props */
export const Settings = ({
  reset,
  setReset,
  fadeIn,
  practiceModeOn,
  invite
}) => {
  const [menuVisible, setMenuVisibility] = React.useState(true)

  /** @type {SettingsTabs['tabId'] | false} */
  const initialState = /** {const} */ (false)

  const [tabValue, setTabValue] = React.useState(initialState)

  const classes = useStyles()

  // // bit hacky: when user presses settingsTab, we DO NOT WANT background map to be selected
  // // because when background map is selected, the entire settings menu is hidden
  // if (reset) {
  //   setReset(false)
  //   if (tabValue === 'BackgroundMap') setTabValue(false)
  // }

  // React.useEffect(() => {
  //   if (tabValue === 'BackgroundMap') {
  //     setMenuVisibility(false)
  //     return
  //   }
  //
  //   if (!menuVisible) setMenuVisibility(true)
  // }, [tabValue, menuVisible])

  return (
    <SettingsProvider practiceModeOn={practiceModeOn} invite={invite}>
      <Fade in={reset || fadeIn} timeout={FADE_DURATION}>
        <Paper className={classes.container}>
          {menuVisible && (
            <Fade in={menuVisible} timeout={FADE_DURATION}>
              <Paper className={classes.tabs}>
                <SettingsMenu
                  tabs={tabs}
                  currentTab={tabValue}
                  setCurrentTab={setTabValue}
                />
              </Paper>
            </Fade>
          )}

          {/* {tabValue === 'BackgroundMap' && (
            <Fade in={tabValue === 'BackgroundMap'} timeout={FADE_DURATION}>
              <Paper className={classes.container}>
                <BGMaps setCurrentTab={setTabValue} />
              </Paper>
            </Fade>
          )}
      
          {tabValue === 'AboutMapeo' && (
            <div>
              <h1>Build About Mapeo Here</h1>
            </div>
          )} */}

          {tabValue === 'ProjConfig' && (
            <Fade in={tabValue === 'ProjConfig'} timeout={FADE_DURATION}>
              <Paper className={classes.container}>
                <ProjectConfig />
              </Paper>
            </Fade>
          )}
        </Paper>
      </Fade>
    </SettingsProvider>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    textAlign: 'start',
    height: '100%',
    flex: 1
  },
  tabs: {
    padding: '6px 24px 6px 40',
    textTransform: 'none',
    textAlign: 'left',
    display: 'flex',
    width: 'auto',
    minWidth: '30%',
    fontSize: 16,
    lineHeight: '30px',
    height: '100%',
    '& .MuiTab-wrapper': {
      justifyContent: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center'
    },
    '& .MuiSvgIcon-root': {
      marginRight: 20,
      marginLeft: 20
    },
    '& .MuiTabs-root': {
      flex: 1
    },
    '& .MuiTab-root': {
      maxWidth: 'none'
    },
    '& .PrivateTabIndicator-root-2': {
      visibility: 'hidden'
    },
    '& .Mui-selected': {
      backgroundColor: '#F6F6F6'
    }
  }
})
