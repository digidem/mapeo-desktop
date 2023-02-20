import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import MapIcon from '@material-ui/icons/Map'
import MediaIcon from '@material-ui/icons/Apps'
import ReportIcon from '@material-ui/icons/LibraryBooks'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import { defineMessages, useIntl } from 'react-intl'
import clsx from 'clsx'

const m = defineMessages({
  mapTabLabel: {
    id: 'renderer.components.MapFilter.Toolbar.mapTabLabel',
    defaultMessage: 'Map'
  },
  mediaTabLabel: {
    id: 'renderer.components.MapFilter.Toolbar.mediaTabLabel',
    defaultMessage: 'Media'
  },
  reportTabLabel: {
    id: 'renderer.components.MapFilter.Toolbar.reportTabLabel',
    defaultMessage: 'Report'
  }
})

const TabItem = ({ selected, ...props }) => {
  const cx = useStyles()
  return (
    <Button
      disableRipple
      {...props}
      className={clsx(cx.tabItem, selected && 'selected')}
    />
  )
}

const MapFilterToolbar = ({ view, onChange, actionRight }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()

  const handleChange = view => e => onChange(view)
  return (
    <React.Fragment>
      <AppBar
        position='static'
        color='inherit'
        elevation={0}
        className={cx.root}
      >
        <Toolbar className={cx.toolbar}>
          <div className={cx.tabGroup}>
            <TabItem
              aria-label='map view'
              selected={view === 'map'}
              onClick={handleChange('map')}
            >
              <MapIcon />
              <span className={cx.tabLabel}>{t(m.mapTabLabel)}</span>
            </TabItem>
            <TabItem
              aria-label='media view'
              selected={view === 'media'}
              onClick={handleChange('media')}
            >
              <MediaIcon />
              <span className={cx.tabLabel}>{t(m.mediaTabLabel)}</span>
            </TabItem>
            <TabItem
              aria-label='report view'
              selected={view === 'report'}
              onClick={handleChange('report')}
            >
              <ReportIcon />
              <span className={cx.tabLabel}>{t(m.reportTabLabel)}</span>
            </TabItem>
          </div>
          {actionRight}
        </Toolbar>
      </AppBar>
    </React.Fragment>
  )
}

export default MapFilterToolbar

const useStyles = makeStyles(theme => ({
  root: {
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    '@media only print': {
      display: 'none'
    }
  },
  toolbar: {
    justifyContent: 'space-between',
    padding: '0 12px'
  },
  tabItem: {
    height: '44px',
    flex: '1',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '0 16px 0 16px',
    justifyContent: 'stretch',
    textTransform: 'capitalize',
    '&.selected': {
      color: 'white',
      backgroundColor: '#2469f6 !important'
    },
    '&:not(:last-child)': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0'
    },
    '&:not(:first-child)': {
      borderLeft: '1px solid transparent',
      marginLeft: '-1px',
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0'
    },
    '& .MuiSvgIcon-root': {}
  },
  tab: {
    height: 44,
    flex: 1,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    textTransform: 'capitalize',
    color: 'rgba(0, 0, 0, 0.87)',
    justifyContent: 'stretch',
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: '#2469F6 !important'
    },
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1)
    }
  },
  tabIcon: {},
  tabLabel: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 500,
    flex: 1
  },
  tabGroup: {
    flex: 1,
    maxWidth: 350,
    display: 'inline-flex',
    borderRadius: '4px',
    backgroundColor: '#fff'
  },
  toolbarButton: {}
}))
