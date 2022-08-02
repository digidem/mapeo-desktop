// @ts-check
import * as React from 'react'

// used for typedef
// eslint-disable-next-line no-unused-vars
import { defineMessages, MessageDescriptor } from 'react-intl'
import AssignmentIcon from '@material-ui/icons/Assignment'
import { makeStyles } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'

import { SettingsMenu } from './SettingsMenu'
import { ProjectConfig } from './ProjectConfig'
import { SettingsProvider } from './SettingsContext'

const m = defineMessages({
  // Setting menu option: Project Configuration
  projConfig: 'Project Configuration',
  projConfiSubHeader: 'Categories, icons, and questions'
})

const FADE_DURATION = 700

/** @typedef {{tabId:SettingTabId, icon:(string | React.ReactElement<any, string | React.JSXElementConstructor<any>>), label:MessageDescriptor, subHeader:MessageDescriptor}} SettingsTabs */

// This is for strong typing of the props for the SettingsMenu component tab values. When we have more tabs, we can them to this type.
/** @typedef {'ProjConfig'} SettingTabId */

/** @type {SettingsTabs[]} */
const tabs = /** @typedef {const} */ [
  {
    tabId: 'ProjConfig',
    icon: <AssignmentIcon />,
    label: m.projConfig,
    subHeader: m.projConfiSubHeader
  }
]

/**
 * @typedef SettingsProp
 * @prop {boolean} fadeIn
 * @prop {boolean} practiceModeOn
 */

/** @param {SettingsProp} props */
export const Settings = ({ fadeIn, practiceModeOn }) => {
  // eslint-disable-next-line no-unused-vars
  const [menuVisible, setMenuVisibility] = React.useState(true)

  /** @type {SettingsTabs['tabId'] | false} */
  const initialState = /** {const} */ (false)

  const [tabValue, setTabValue] = React.useState(initialState)

  const classes = useStyles()

  return (
    <SettingsProvider practiceModeOn={practiceModeOn}>
      <Fade in={fadeIn} timeout={FADE_DURATION}>
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
