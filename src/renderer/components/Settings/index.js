// I turned off ts check because of tabType being both a string and false. JSDOC seems to not like that
import * as React from 'react'
import { SettingsMenu } from './SettingsMenu'
import { defineMessages } from 'react-intl'
import MapIcon from '@material-ui/icons/MapOutlined'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import { BGMaps } from './BGMaps'
import { makeStyles } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'

const m = defineMessages({
  backgroundMap: 'Background Map',
  aboutMapeo: 'About Mapeo'
})

const useStyles = makeStyles({
  container: {
    display: 'flex',
    textAlign: 'start',
    height: '100%'
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

const FADE_DURATION = 700

/** @typedef {{tabId:string, icon:(string | React.ReactElement<any, string | React.JSXElementConstructor<any>>), label:import('react-intl').MessageDescriptor}} SettingsTabs */

/** @type {SettingsTabs[]} */
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
 * @typedef {SettingsTabs['tabId'] | false} tabType
 */

/**
 *
 * @typedef SettingsProp
 * @prop {boolean} reset
 * @prop {function(boolean):void} setReset
 * @prop {boolean} fadeIn
 */

/** @param {SettingsProp} props */
export const Settings = ({ reset, setReset, fadeIn }) => {
  /**
   * @type {[boolean, (boolean)=>void]} menu
   */
  const [menuVisible, setMenuVisibility] = React.useState(true)

  /** @type {tabType} */
  const initialState = false

  const [tabValue, setTabValue] = React.useState(initialState)

  const classes = useStyles()

  // bit hacky: when user presses settingsTab, we DO NOT WANT background map to be selected
  // because when background map is selected, the entire settings menu is hidden
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
              <BGMaps setCurrentTab={setTabValue} />
            </Paper>
          </Fade>
        )}

        {tabValue === 'AboutMapeo' && (
          <div>
            <h1>Build About Mapeo Here</h1>
          </div>
        )}
      </Paper>
    </Fade>
  )
}
