// @ts-check
import * as React from 'react'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import MapIcon from '@material-ui/icons/MapOutlined'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { BGMaps } from './BGMaps'
import { makeStyles } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'
import { AboutMapeo } from './AboutMapeo'

const m = defineMessages({
  backgroundMap: 'Background Map',
  aboutMapeo: 'About Mapeo'
})

const FADE_DURATION = 700

/** @typedef {'BackgroundMap' | 'AboutMapeo'} SettingTabId */

/** @type {import('./SettingsMenu').SettingsTabs[]} */
const tabs = /** @typedef {const} */ [
  {
    tabId: 'BackgroundMap',
    icon: <MapIcon />,
    label: m.backgroundMap
  },
  {
    tabId: 'AboutMapeo',
    icon: <InfoIcon />,
    label: m.aboutMapeo
  }
]

/**
 *
 * @typedef SettingsProp
 * @prop {boolean} reset
 * @prop {function(boolean):void} setReset
 * @prop {boolean} fadeIn
 */

/** @param {SettingsProp} props */
export const Settings = ({ reset, setReset, fadeIn }) => {
  const [menuVisible, setMenuVisibility] = React.useState(true)

  /** @type {import('./SettingsMenu').SettingsTabs['tabId'] | false} */
  const initialState = /** {const} */ (false)

  const [tabValue, setTabValue] = React.useState(initialState)

  const classes = useStyles()

  if (reset) {
    setReset(false)
    if (tabValue === 'BackgroundMap') setTabValue(false)
  }

  React.useEffect(() => {
    if (tabValue === 'BackgroundMap') {
      setMenuVisibility(false)
      return
    }

    if (!menuVisible) setMenuVisibility(true)
  }, [tabValue, menuVisible])

  // Controlling most of the fade in animations here
  return (
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

        {tabValue === 'BackgroundMap' && (
          <Fade in={tabValue === 'BackgroundMap'} timeout={FADE_DURATION}>
            <Paper className={classes.container}>
              <BGMaps
                openSettings={() => {
                  setTabValue(false)
                }}
              />
            </Paper>
          </Fade>
        )}

        {tabValue === 'AboutMapeo' && (
          <Fade in={tabValue === 'AboutMapeo'} timeout={FADE_DURATION}>
            <Paper className={classes.container}>
              <AboutMapeo />
            </Paper>
          </Fade>
        )}
      </Paper>
    </Fade>
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
    }
  }
})
